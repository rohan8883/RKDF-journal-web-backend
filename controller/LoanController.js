import User from 'models/user.model.js';
import Subscription from 'models/subscription.model';
import Loan from 'models/loan.model';
import Transaction from 'models/transaction.model';
// ════════════════════════════║  API TO Provide Loan to Eligible User   ║═════════════════════════════════//
/**
 * @route POST /api/loans
 * @desc Provide a loan to an eligible user, capped at total paid amount
 * @body {userId, amount, duration, startDate}
 * @returns Loan and transaction objects
 */
export async function ProvideLoan(req, res) {
  try {
    const { userId, amount, duration, startDate } = req.body;

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isEligibleForLoan) return res.status(403).json({ error: 'User is not eligible for a loan' });

    // Calculate total paid amount
    const subscriptions = await Subscription.find({ userId: user._id });
    const totalPaid = subscriptions.reduce((sum, sub) => {
      return sum + sub.paymentSchedule.reduce((subSum, p) => subSum + p.paidAmount, 0);
    }, 0);

    // Restrict loan amount
    if (amount > totalPaid) {
      return res.status(400).json({ error: `Loan amount cannot exceed total paid amount: ₹${totalPaid}` });
    }

    // Calculate loan details
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);
    const interestRate = 8;
    const totalRepayment = amount + (amount * interestRate) / 100;
    const monthlyRepayment = totalRepayment / duration;

    const repaymentSchedule = Array.from({ length: duration }, (_, i) => {
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i + 1);
      return {
        dueDate,
        amountDue: monthlyRepayment,
        paidAmount: 0,
        isLate: false
      };
    });

    const loan = new Loan({
      userId: user._id,
      amount,
      interestRate,
      duration,
      startDate: start,
      endDate: end,
      repaymentSchedule
    });

    const transaction = new Transaction({
      userId: user._id,
      type: 'loan_disbursement',
      amount,
      referenceId: loan._id,
      status: 'completed'
    });

    await Promise.all([loan.save(), transaction.save()]);
    res.status(201).json({ loan, transaction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


