import User from '@/models/User';
import Degree from '@/models/Degree';
import Curriculum from '@/models/Curriculum';
import Proposal from '@/models/Proposal';

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
  createProposal: async (_: any, { input }: { input: { curriculum_id: string; state: string; exams?: any[][]; attachments?: any[] } }) => {
    try {
      // TODO: Add validation similar to original controller
      const curriculum = await Curriculum.findById(input.curriculum_id);
      if (!curriculum) throw new Error('Curriculum not found');

      const degree = await Degree.findById(curriculum.degree_id);
      if (!degree) throw new Error('Degree not found');

      const proposal = new Proposal({
        ...input,
        curriculum_name: curriculum.name,
        degree_academic_year: degree.academic_year,
        degree_name: degree.name,
        degree_id: degree._id,
        date_modified: new Date(),
        date_submitted: input.state === 'submitted' ? new Date() : null,
        exams: input.exams || curriculum.years.map(() => []),
        attachments: input.attachments || [],
      });

      await proposal.save();
      return proposal;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  },
  updateProposal: async (_: any, { id, input }: { id: string; input: { curriculum_id?: string; state?: string; exams?: any[][]; attachments?: any[] } }) => {
    try {
      // TODO: Add validation and permission checks
      const updateData: any = { ...input };
      if (input.state) {
        updateData.date_modified = new Date();
        if (input.state === 'submitted') {
          updateData.date_submitted = new Date();
        }
      }

      const updatedProposal = await Proposal.findByIdAndUpdate(id, updateData, { new: true });
      return updatedProposal;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  },
  deleteProposal: async (_: any, { id }: { id: string }) => {
    try {
      // TODO: Add permission checks
      await Proposal.findByIdAndDelete(id);
      return true;
    } catch (error) {
      console.error('Error deleting proposal:', error);
      return false;
    }
  },
  changeProposalState: async (_: any, { id, state }: { id: string; state: string }) => {
    try {
      // TODO: Add admin permission checks
      const updateData: any = { state, date_modified: new Date() };
      if (state === 'approved' || state === 'rejected') {
        updateData.date_managed = new Date();
      } else {
        updateData.date_managed = null;
      }

      const updatedProposal = await Proposal.findByIdAndUpdate(id, updateData, { new: true });
      return updatedProposal;
    } catch (error) {
      console.error('Error changing proposal state:', error);
      throw error;
    }
  },
};