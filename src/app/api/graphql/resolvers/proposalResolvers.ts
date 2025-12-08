import User from '@/models/User';
import Curriculum from '@/models/Curriculum';
import Degree from '@/models/Degree';

export const Proposal = {
  user: async (parent: any) => {
    return await User.findById(parent.user_id);
  },
  curriculum: async (parent: any) => {
    return await Curriculum.findById(parent.curriculum_id);
  },
  degree: async (parent: any) => {
    return await Degree.findById(parent.degree_id);
  },
};