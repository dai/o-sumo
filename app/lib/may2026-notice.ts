import { type TorikumiArchiveDay, type TorikumiDataSet } from './torikumi-data';

export function getLatestPublishedScheduleDay(archive: TorikumiDataSet): TorikumiArchiveDay | undefined {
  const publishedDays = (archive.scheduleDays ?? []).filter((day) => day.status === 'published');
  return publishedDays.sort((a, b) => b.day - a.day)[0];
}

function getLatestPublishedResultDay(archive: TorikumiDataSet): TorikumiArchiveDay | undefined {
  const publishedDays = (archive.resultDays ?? []).filter((day) => day.status === 'published');
  return publishedDays.sort((a, b) => b.day - a.day)[0];
}

export function getMay2026NoticeParams(
  archive: TorikumiDataSet,
): { resultDay: number; scheduleDay: number } {
  const latestScheduleDay = getLatestPublishedScheduleDay(archive);
  const latestResultDay = getLatestPublishedResultDay(archive);
  const scheduleDay = latestScheduleDay?.day ?? 1;
  const resultDay = latestResultDay?.day ?? 1;
  const effectiveScheduleDay = Math.min(scheduleDay, resultDay + 1);

  return {
    resultDay: Math.max(1, resultDay),
    scheduleDay: Math.max(1, effectiveScheduleDay),
  };
}
