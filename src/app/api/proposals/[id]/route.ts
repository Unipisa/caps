import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Proposal from '@/models/Proposal';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/caps';
mongoose.connect(mongoUri);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = await Proposal.findById(params.id)
      .populate('user_id', 'username name first_name last_name email')
      .populate('curriculum_id', 'name')
      .populate('degree_id', 'name academic_year');

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { curriculum_id, state, exams, attachments } = body;

    const updateData: any = {};
    if (curriculum_id) updateData.curriculum_id = curriculum_id;
    if (state) {
      updateData.state = state;
      updateData.date_modified = new Date();
      if (state === 'submitted') {
        updateData.date_submitted = new Date();
      }
    }
    if (exams) updateData.exams = exams;
    if (attachments) updateData.attachments = attachments;

    const proposal = await Proposal.findByIdAndUpdate(params.id, updateData, { new: true })
      .populate('user_id', 'username name first_name last_name email')
      .populate('curriculum_id', 'name')
      .populate('degree_id', 'name academic_year');

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = await Proposal.findByIdAndDelete(params.id);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}