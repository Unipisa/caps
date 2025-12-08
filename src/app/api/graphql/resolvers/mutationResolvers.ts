import User from '@/models/User';
import Degree from '@/models/Degree';
import Curriculum from '@/models/Curriculum';

export const Mutation = {
  createUser: async (_: any, { username, password, admin }: { username: string; password: string; admin?: boolean }) => {
    const user = new User({ username, admin: admin || false });
    await (user as any).setPassword(password);
    await user.save();
    return user;
  },
  updateDegree: async (_: any, { id, input }: { id: string, input: any }) => {
    try {
      const updatedDegree = await Degree.findByIdAndUpdate(id, input, { new: true });
      if (updatedDegree) {
        return {
          id: updatedDegree._id,
          name: updatedDegree.name,
          academic_year: updatedDegree.academic_year,
          years: updatedDegree.years,
          enabled: updatedDegree.enabled,
          sharing_mode: updatedDegree.sharing_mode,
          groups: Object.fromEntries(updatedDegree.groups),
          default_group: updatedDegree.default_group,
          approval_confirmation: updatedDegree.approval_confirmation,
          rejection_confirmation: updatedDegree.rejection_confirmation,
          submission_confirmation: updatedDegree.submission_confirmation,
          approval_message: updatedDegree.approval_message,
          rejection_message: updatedDegree.rejection_message,
          submission_message: updatedDegree.submission_message,
          free_choice_message: updatedDegree.free_choice_message,
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating degree:', error);
      throw error;
    }
  },
  deleteDegree: async (_: any, { id }: { id: string }) => {
    try {
      await Degree.findByIdAndDelete(id);
      return true;
    } catch (error) {
      console.error('Error deleting degree:', error);
      return false;
    }
  },
  createCurriculum: async (_: any, { input }: { input: { name: string; notes?: string; degree_id: string } }) => {
    try {
      const curriculum = new Curriculum(input);
      await curriculum.save();
      return curriculum;
    } catch (error) {
      console.error('Error creating curriculum:', error);
      throw error;
    }
  },
  updateCurriculum: async (_: any, { id, input }: { id: string; input: { name?: string; notes?: string; degree_id?: string } }) => {
    try {
      const updatedCurriculum = await Curriculum.findByIdAndUpdate(id, input, { new: true });
      return updatedCurriculum;
    } catch (error) {
      console.error('Error updating curriculum:', error);
      throw error;
    }
  },
  deleteCurriculum: async (_: any, { id }: { id: string }) => {
    try {
      await Curriculum.findByIdAndDelete(id);
      return true;
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      return false;
    }
  },
};