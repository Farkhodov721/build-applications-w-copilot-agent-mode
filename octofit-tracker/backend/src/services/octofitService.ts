import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string) {
  return Object.assign(new Error(message), { status: 404 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = (input ?? {}) as Record<string, unknown>;
  if (!userId || !teamId || !type || minutes === undefined || minutes === null) {
    throw badRequest('userId, teamId, type, and minutes are required');
  }
  if (!mongoose.Types.ObjectId.isValid(String(userId)) || !mongoose.Types.ObjectId.isValid(String(teamId))) {
    throw badRequest('userId and teamId must be valid ids');
  }
  const numericMinutes = Number(minutes);
  if (!Number.isFinite(numericMinutes) || numericMinutes <= 0) {
    throw badRequest('minutes must be a positive number');
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user) throw notFound('user not found');
  if (!team) throw notFound('team not found');
  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: String(type),
    minutes: numericMinutes,
    points: numericMinutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members } = (input ?? {}) as Record<string, unknown>;
  if (!name || !mascot) {
    throw badRequest('name and mascot are required');
  }
  const team = await Team.create({ name: String(name), mascot: String(mascot), members: members ?? [] });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map((entry) => entry._id) } }).lean();
  const teamMap = new Map(teams.map((team) => [team._id.toString(), team]));
  return totals.map((entry, index) => ({
    teamName: teamMap.get(entry._id.toString())?.name ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) throw notFound('user not found');

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 });
  const activityFocus: Record<string, string> = { run: 'endurance', cycle: 'endurance', strength: 'strength' };
  const focus = (recentActivity && activityFocus[recentActivity.type]) || user.fitnessGoal;

  let workouts = await Workout.find({ focus }).lean();
  if (workouts.length === 0) workouts = await Workout.find({ focus: user.fitnessGoal }).lean();
  if (workouts.length === 0) workouts = await Workout.find().limit(1).lean();

  const reason = recentActivity
    ? `Matches your recent ${recentActivity.type} activity and your ${user.fitnessGoal} fitness goal`
    : `Matches your ${user.fitnessGoal} fitness goal`;

  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
