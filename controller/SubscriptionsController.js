import User from 'models/user.model.js';
import Plan from 'models/planMaster.model.js';
import Subscription from 'models/subscription.model';
import Transaction from 'models/transaction.model';
// ════════════════════════════║  API TO Create Subscription   ║═════════════════════════════════//
export async function CreateSubscription(req, res) {
  try {
    const { userId, planId, startDate } = req.body;

    // Validate User and Plan existence
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Calculate end date and payment schedule
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.duration);

    const monthlyAmount = plan.amount / plan.duration;
    const paymentSchedule = Array.from({ length: plan.duration }, (_, i) => {
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i);
      return {
        dueDate,
        amountDue: monthlyAmount,
        paidAmount: 0,
        isLate: false
      };
    });

    const subscription = new Subscription({
      userId: user._id,
      planId: plan._id,
      startDate: start,
      endDate: end,
      totalAmount: plan.amount,
      paymentSchedule
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// Get User Payment Due Amount
/**
 * @route GET /api/subscriptions/:subscriptionId/due-amount
 * @desc Calculate the total amount a user needs to pay for a subscription, including overdue and fines
 * @param subscriptionId
 * @query {asOfDate} - Optional date to calculate due amount as of (defaults to current date)
 * @returns Object with total due, breakdown of overdue, upcoming, and fines
 */
export async function PaymentDueAmount (req,res){
  try {
    const { subscriptionId } = req.params;
    const { asOfDate } = req.query; // Optional query parameter for date

    const subscription = await Subscription.findById(subscriptionId).populate('planId', 'fineRate');
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    if (subscription.status === 'completed') return res.status(200).json({ totalDue: 0, details: 'Subscription completed' });

    const currentDate = asOfDate ? new Date(asOfDate) : new Date();

    // Calculate due amounts
    let overdueAmount = 0;
    let upcomingAmount = 0;
    let fineAmount = 0;

    for (const payment of subscription.paymentSchedule) {
      const remainingDue = payment.amountDue - payment.paidAmount;
      if (remainingDue <= 0) continue;

      if (currentDate >= payment.dueDate) {
        // Overdue payment
        overdueAmount += remainingDue;
        if (!payment.paidOn || currentDate > payment.dueDate) {
          fineAmount += (subscription.planId.fineRate / 100) * payment.amountDue;
        }
      } else {
        // Upcoming payment
        upcomingAmount += remainingDue;
      }
    }

    const totalDue = overdueAmount + fineAmount; // Only overdue + fines are immediately payable

    res.status(200).json({
      subscriptionId: subscription._id,
      totalDue,
      breakdown: {
        overdueAmount,
        upcomingAmount,
        fineAmount
      },
      asOfDate: currentDate
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

}
// ════════════════════════════║  API TO Make Payment for Subscription   ║═════════════════════════════════//
/**
 * @route POST /api/payments
 * @desc Record a payment for a subscription
 * @body {subscriptionId, amount, paymentDate}
 * @returns Updated subscription and transaction objects
 */
export async function MakePaymentForSubscription (req,res){
  try {
    const { subscriptionId, amount, paymentDate } = req.body;

    const subscription = await Subscription.findById(subscriptionId).populate('userId planId');
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const currentDate = new Date(paymentDate || Date.now());
    let remainingAmount = amount;

    // Update payment schedule
    for (let payment of subscription.paymentSchedule) {
      if (remainingAmount <= 0) break;
      if (payment.paidAmount < payment.amountDue) {
        const due = payment.amountDue - payment.paidAmount;
        const paymentToApply = Math.min(due, remainingAmount);
        payment.paidAmount += paymentToApply;
        payment.paidOn = currentDate;
        payment.isLate = currentDate > payment.dueDate;
        remainingAmount -= paymentToApply;
      }
    }

    // Update subscription status and interest
    const allPaid = subscription.paymentSchedule.every(p => p.paidAmount >= p.amountDue);
    if (allPaid) {
      subscription.status = 'completed';
      subscription.interestEarned = (subscription.totalAmount * subscription.planId.interestRate) / 100;
    } else if (subscription.paymentSchedule.some(p => p.paidAmount > 0)) {
      subscription.status = 'active';
    }

    // Apply fine for late payments
    const latePayments = subscription.paymentSchedule.filter(p => p.isLate);
    if (latePayments.length > 0) {
      subscription.fineCharged = latePayments.reduce((total, p) => {
        return total + ((subscription.planId.fineRate / 100) * p.amountDue);
      }, 0);
    }

    // Update user payment history and loan eligibility
    const totalPaid = subscription.paymentSchedule.reduce((sum, p) => sum + p.paidAmount, 0);
    if (totalPaid > 0) {
      await User.updateOne(
        { _id: subscription.userId._id },
        {
          $push: {
            paymentHistory: {
              planId: subscription.planId._id,
              status: latePayments.length > 0 ? 'late' : 'timely',
              completedAt: allPaid ? currentDate : null
            }
          },
          $set: { isEligibleForLoan: true }
        }
      );
    }

    // Record transaction
    const transaction = new Transaction({
      userId: subscription.userId._id,
      type: 'payment',
      amount,
      referenceId: subscription._id,
      status: 'completed'
    });

    await Promise.all([subscription.save(), transaction.save()]);
    res.status(200).json({ subscription, transaction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

}

