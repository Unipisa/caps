import Degree from '../../../../../models/Degree';

export const Curriculum = {
  degree: async (parent: any) => {
    return await Degree.findById(parent.degree_id);
  },
};