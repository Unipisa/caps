import User from '../../../../../models/User';
import Exam from '../../../../../models/Exam';
import Degree from '../../../../../models/Degree';
import Curriculum from '../../../../../models/Curriculum';
import Proposal from '../../../../../models/Proposal';

export const Query = {
  users: async () => {
    return await User.find();
  },
  user: async (_: any, { id }: { id: string }) => {
    return await User.findById(id);
  },
  exams: async () => {
    return await Exam.find();
  },
  examsByIds: async (_: any, { ids }: { ids: string[] }) => {
    return await Exam.find({ _id: { $in: ids } });
  },
  exam: async (_: any, { id }: { id: string }) => {
    return await Exam.findById(id);
  },
  degrees: async () => {
    const degrees = await Degree.find();
    return degrees.map(deg => ({
      id: deg._id,
      name: deg.name,
      academic_year: deg.academic_year,
      years: deg.years,
      enabled: deg.enabled,
      sharing_mode: deg.sharing_mode,
    }));
  },
  degree: async (_: any, { id }: { id: string }) => {
    const deg = await Degree.findById(id);
    if (deg) {
      return {
        id: deg._id,
        name: deg.name,
        academic_year: deg.academic_year,
        years: deg.years,
        enabled: deg.enabled,
        sharing_mode: deg.sharing_mode,
        groups: Object.fromEntries(deg.groups),
        default_group: deg.default_group,
        approval_confirmation: deg.approval_confirmation,
        rejection_confirmation: deg.rejection_confirmation,
        submission_confirmation: deg.submission_confirmation,
        approval_message: deg.approval_message,
        rejection_message: deg.rejection_message,
        submission_message: deg.submission_message,
        free_choice_message: deg.free_choice_message,
      };
    }
    return null;
  },
  curricula: async () => {
    return await Curriculum.find();
  },
  curriculum: async (_: any, { id }: { id: string }) => {
    return await Curriculum.findById(id);
  },
  proposals: async () => {
    return await Proposal.find();
  },
  proposal: async (_: any, { id }: { id: string }) => {
    return await Proposal.findById(id);
  },
};