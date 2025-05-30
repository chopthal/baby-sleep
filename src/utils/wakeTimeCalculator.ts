import { ActivityRecord } from "../app/page";

export interface ActivityWithWakeTime extends ActivityRecord {
  previousWakeTime?: string; // "2시간 30분" 형태
}

export function calculateWakeTimes(
  activities: ActivityRecord[]
): ActivityWithWakeTime[] {
  // 수면 활동만 필터링 (밤잠, 낮잠)
  const sleepActivities = activities.filter(
    (activity) => activity.type === "밤잠" || activity.type === "낮잠"
  );

  // 날짜별로 그룹화
  const activitiesByDate = sleepActivities.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {} as Record<string, ActivityRecord[]>);

  const result: ActivityWithWakeTime[] = [...activities];

  // 날짜순으로 정렬된 키들
  const sortedDates = Object.keys(activitiesByDate).sort();

  let previousSleepEnd: { time: string; date: string } | null = null;

  for (const date of sortedDates) {
    const dayActivities = activitiesByDate[date];

    // 하루 내 수면 활동을 시간순으로 정렬
    const sortedDayActivities = dayActivities.sort((a, b) => {
      const getStartTime = (activity: ActivityRecord) => {
        if (activity.type === "밤잠") {
          return (
            activity.layDownTime ||
            activity.fallAsleepTime ||
            activity.startTime
          );
        }
        return (
          activity.layDownTime || activity.fallAsleepTime || activity.startTime
        );
      };

      const timeA = getStartTime(a);
      const timeB = getStartTime(b);

      return timeA.localeCompare(timeB);
    });

    for (let i = 0; i < sortedDayActivities.length; i++) {
      const currentActivity = sortedDayActivities[i];
      const resultIndex = result.findIndex((r) => r.id === currentActivity.id);

      if (resultIndex === -1) continue;

      let wakeTime: string | undefined;

      if (i === 0 && previousSleepEnd) {
        // 하루의 첫 번째 수면이지만 전날 수면이 있는 경우
        const currentStart =
          currentActivity.layDownTime ||
          currentActivity.fallAsleepTime ||
          currentActivity.startTime;
        wakeTime = calculateTimeDifference(
          previousSleepEnd.time,
          currentStart,
          previousSleepEnd.date,
          date
        );
      } else if (i > 0) {
        // 하루 내에서 이전 수면이 있는 경우
        const previousActivity = sortedDayActivities[i - 1];
        const previousEnd = previousActivity.endTime;
        const currentStart =
          currentActivity.layDownTime ||
          currentActivity.fallAsleepTime ||
          currentActivity.startTime;

        if (previousEnd) {
          wakeTime = calculateTimeDifference(
            previousEnd,
            currentStart,
            date,
            date
          );
        }
      }

      result[resultIndex] = {
        ...result[resultIndex],
        previousWakeTime: wakeTime,
      };

      // 다음 계산을 위해 현재 수면의 종료 시간 저장
      if (currentActivity.endTime) {
        previousSleepEnd = {
          time: currentActivity.endTime,
          date: date,
        };
      }
    }
  }

  return result;
}

function calculateTimeDifference(
  startTime: string,
  endTime: string,
  startDate: string,
  endDate: string
): string {
  const startDateTime = new Date(`${startDate}T${startTime}`);
  let endDateTime = new Date(`${endDate}T${endTime}`);

  // 밤잠이 다음날로 넘어가는 경우 처리
  if (endDateTime <= startDateTime) {
    endDateTime.setDate(endDateTime.getDate() + 1);
  }

  const diffMs = endDateTime.getTime() - startDateTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 0) {
    return "시간 계산 오류";
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) {
    return `${minutes}분`;
  } else if (minutes === 0) {
    return `${hours}시간`;
  } else {
    return `${hours}시간 ${minutes}분`;
  }
}
