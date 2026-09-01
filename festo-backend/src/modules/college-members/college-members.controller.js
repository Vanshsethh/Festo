import * as membersService from './college-members.service.js';

export const listMembers = async (req, res, next) => {
  try {
    const members = await membersService.listMembers(req.user, req.params.collegeId);
    return res.status(200).json({
      success: true,
      data: {
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const member = await membersService.addOrganizer(req.user, req.params.collegeId, req.body);
    return res.status(201).json({
      success: true,
      data: {
        member,
        message: 'Organizer added successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const result = await membersService.removeOrganizer(req.user, req.params.collegeId, req.params.memberId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};