import { Request, Response, NextFunction } from 'express';
import * as membersService from './college-members.service.js';

export const listMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const members = await membersService.listMembers(req.user!, req.params.collegeId as string);
    res.status(200).json({
      success: true,
      data: {
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await membersService.addOrganizer(req.user!, req.params.collegeId as string, req.body);
    res.status(201).json({
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

export const removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await membersService.removeOrganizer(req.user!, req.params.collegeId as string, req.params.memberId as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
