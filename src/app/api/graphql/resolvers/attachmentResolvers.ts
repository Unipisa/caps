import User from '@/models/User';

export const Attachment = {
  uploader: async (parent: any) => {
    return await User.findById(parent.uploader_id);
  },
};