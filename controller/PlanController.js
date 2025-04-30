import Plan from '../models/planMaster.model.js';
// ════════════════════════════║  API TO Create a Plan   ║═════════════════════════════════//
/**
 * @route   POST /api/plans
 * @desc    Create a new plan
 * @body    { planName, amount, duration, interestRate, fineRate, description }
 * @returns Plan object
 */
export async function CreatePlan (req,res){
  try {
    const { planName, amount, duration, interestRate, fineRate, description } = req.body;

    // Basic validation (optional but useful)
    if (!planName || !amount || !duration || !interestRate || !fineRate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const plan = new Plan({
      planName,
      amount,
      duration,
      interestRate,
      fineRate,
      description
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

}
export const GetAllPlans = async (req, res) => {
  const { page = 1, limit = 10, q } = req.query;
  const options = { page, limit };

  try {
    let query = [
      { $sort: { createdAt: -1 } },
      { $project: { __v: 0 } }
    ];

    if (q) {
      query.push({
        $match: {
          $or: [
            { planName: { $regex: new RegExp(q, 'i') } },
            { description: { $regex: new RegExp(q, 'i') } }
          ]
        }
      });
    }

    const aggregate = Plan.aggregate(query);
    const plans = await Plan.aggregatePaginate(aggregate, options);

    if (!plans) {
      return res.status(404).json({ success: false, message: 'No records found!' });
    }

    return res.status(200).json({
      success: true,
      message: 'Plans fetched successfully.',
      data: plans
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetPlanById = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Plan fetched successfully.',
      data: plan
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdatePlan = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    await Plan.findByIdAndUpdate(id, updateFields, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeletePlan = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    await Plan.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Plan deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export async function TogglePlanStatus(req, res) {
  const { id } = req.params;
  const status = await Plan.findOne({ _id: id });
  try {
    const PlanDetails = await Plan.findOneAndUpdate(
      { _id: id },
      {
        // if status is 1, then change to 0, and vice
        status: status?.status == 1 ? 0 : 1
      },
      { new: true }
    );

    if (!PlanDetails) {
      return res.status(200).json({
        success: false,
        message: 'Plan not found'
      });
    }
    return res.status(200).json({
      success: true,
      message:
      PlanDetails?.status == 1 ? 'Plan is Activated' : 'Plan is Deactivated',
      data: PlanDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error
    });
  }
}


