import PlanMaster from '../models/planMaster.model.js'; 
import Joi from 'joi';
import mongoose from 'mongoose';

// crete plan master
export async function CreatePlanMaster(req, res) {
  const ownerId = req.user._id;
  
  const { planName } = req.body;
  try {
    const schema = Joi.object({
      planName: Joi.string()
        .required()
        .min(1)
        .max(50)
        .label('planName is not more than 50 characters')
    });
    const newPlan = new PlanMaster({
      planName,
      createdById:ownerId,
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(200)
        .json({ message: error.details[0].message, success: false });
    }
    await newPlan.save();

    return res.status(201).json({
      success: true,
      message: 'Created successfully.',
      newPlan
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
 

export async function getAllPlans(req, res) {
  const ownerId = req.user._id;  
  const isOwner = req.user.roleId === '676e3938d0f5a92c824fc662';  

  try {
    const query = isOwner ? { createdById: ownerId } : {};
    const plans = await PlanMaster.find(query);

    return res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

 
export async function getAllActivePlans(req, res) {
  const ownerId = req.user._id;  
  const isOwner = req.user.roleId === '676e3938d0f5a92c824fc662';  

  try {
    const query = {
      status: 1 
    };

    if (isOwner) {
      query.createdById = new mongoose.Types.ObjectId(ownerId);
    }

    const plans = await PlanMaster.find(query);

    return res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}



// get plan by id
export async function getPlanById(req, res) {
  const { id } = req.params;
  try {
    const plan = await PlanMaster.findById(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// update plan by id
export async function updatePlanById(req, res) {
  const { id } = req.params;
  const { planName } = req.body;
  try {
    const plan = await PlanMaster.findById(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    const schema = Joi.object({
      planName: Joi.string()
        .required()
        .min(1)
        .max(50)
        .label('planName is not more than 50 characters')
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(200)
        .json({ message: error.details[0].message, success: false });
    }
    const updatedPlan = await PlanMaster.findByIdAndUpdate(
      id,
      { planName },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      data: updatedPlan,
      message: 'Updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// update status if status=0 then status=1 and vice versa
export async function updatePlanStatusById(req, res) {
  const { id } = req.params;
  try {
    const plan = await PlanMaster.findById(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    const updatedPlan = await PlanMaster.findByIdAndUpdate(
      id,
      { status: plan.status === 1 ? 0 : 1 },
      { new: true }
    );
    return res.status(200).json({ success: true, data: updatedPlan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// delete plan by id
export async function deletePlanById(req, res) {
  const { id } = req.params;
  try {
    const plan = await PlanMaster.findById(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    await plan.remove();
    return res
      .status(200)
      .json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
 
