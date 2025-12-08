import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Proposal from '@/models/Proposal';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/caps';
mongoose.connect(mongoUri);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const user_first_name = searchParams.get('user_first_name');
    const user_last_name = searchParams.get('user_last_name');
    const state = searchParams.get('state');
    const curriculum_name = searchParams.get('curriculum_name');
    const degree_name = searchParams.get('degree_name');
    const degree_academic_year = searchParams.get('degree_academic_year') ? parseInt(searchParams.get('degree_academic_year')!) : undefined;

    const query: any = {};
    if (user_id) {
      query.user_id = user_id;
    }
    if (user_first_name) {
      query.user_first_name = new RegExp(user_first_name, 'i');
    }
    if (user_last_name) {
      query.user_last_name = new RegExp(user_last_name, 'i');
    }
    if (state) {
      query.state = state;
    }
    if (curriculum_name) {
      query.curriculum_name = new RegExp(curriculum_name, 'i');
    }
    if (degree_name) {
      query.degree_name = new RegExp(degree_name, 'i');
    }
    if (degree_academic_year) {
      query.degree_academic_year = degree_academic_year;
    }

    const mongoQuery = Proposal.find(query)
      .populate('user_id', 'username name first_name last_name email')
      .populate('curriculum_id', 'name')
      .populate('degree_id', 'name academic_year')
      .sort({ date_modified: -1 });
    
    if (limit) {
      mongoQuery.limit(limit);
    }

    const proposals = await mongoQuery;

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { curriculum_id, state, exams, attachments } = body;

    // Basic validation
    if (!curriculum_id || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Add full validation like in original controller
    const proposal = new Proposal({
      curriculum_id,
      state,
      exams: exams || [],
      attachments: attachments || [],
      date_modified: new Date(),
      date_submitted: state === 'submitted' ? new Date() : null,
    });

    await proposal.save();

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}