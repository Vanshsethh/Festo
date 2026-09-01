import * as collegesService from './colleges.service.js';

export const apply = async (req, res, next) => {
  try {
    const college = await collegesService.applyCollege(req.user, req.body);
    return res.status(201).json({
      success: true,
      data: {
        college,
        message: 'College applied successfully! You are now an organizer for this college.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listVerified = async (req, res, next) => {
  try {
    const result = await collegesService.getVerifiedColleges(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const college = await collegesService.getCollege(req.params.identifier, req.user);
    return res.status(200).json({
      success: true,
      data: {
        college,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const myApplication = async (req, res, next) => {
  try {
    const application = await collegesService.getMyApplication(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const college = await collegesService.updateCollege(req.user, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      data: {
        college,
      },
    });
  } catch (error) {
    next(error);
  }
};