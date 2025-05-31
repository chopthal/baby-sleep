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

  // 모든 수면 활동을 시간순으로 정렬 (날짜와 시간 모두 고려)
  const allSleepActivities = sleepActivities.sort((a, b) => {
    // 날짜 먼저 비교
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;

    // 같은 날짜면 시작 시간으로 비교
    const getStartTime = (activity: ActivityRecord) => {
      return (
        activity.fallAsleepTime ||
        activity.layDownTime ||
        activity.startTime
      );
    };

    const timeA = getStartTime(a);
    const timeB = getStartTime(b);

    return timeA.localeCompare(timeB);
  });

  // 각 수면 활동에 대해 깨시 계산
  for (let i = 1; i < allSleepActivities.length; i++) {
    const currentSleep = allSleepActivities[i];
    const previousSleep = allSleepActivities[i - 1];

    // 이전 수면의 기상시각이 있고, 현재 수면의 입면시각이 있는 경우만 계산
    if (previousSleep.endTime && currentSleep.fallAsleepTime) {
      const wakeTime = calculateTimeDifference(
        previousSleep.endTime,
        currentSleep.fallAsleepTime,
        previousSleep.date,
        currentSleep.date
      );

      // result 배열에서 해당 활동 찾아서 깨시 정보 추가
      const resultIndex = result.findIndex((r) => r.id === currentSleep.id);
      if (resultIndex !== -1) {
        result[resultIndex] = {
          ...result[resultIndex],
          previousWakeTime: wakeTime,
        };
      }
    }
  }

  return result;
}

function calculateTimeDifference(
  wakeUpTime: string,      // 이전 수면의 기상시각
  fallAsleepTime: string,  // 현재 수면의 입면시각
  wakeUpDate: string,      // 이전 수면의 날짜
  fallAsleepDate: string   // 현재 수면의 날짜
): string {
  const wakeUpDateTime = new Date(`${wakeUpDate}T${wakeUpTime}`);
  let fallAsleepDateTime = new Date(`${fallAsleepDate}T${fallAsleepTime}`);

  // 날짜가 다른 경우 처리 (예: 전날 밤잠 기상 → 다음날 낮잠 입면)
  // 또는 같은 날이지만 시간이 역순인 경우 (밤잠이 다음날로 넘어가는 경우)
  if (fallAsleepDateTime <= wakeUpDateTime) {
    fallAsleepDateTime.setDate(fallAsleepDateTime.getDate() + 1);
  }

  const diffMs = fallAsleepDateTime.getTime() - wakeUpDateTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 0) {
    return "시간 계산 오류";
  }

  // 24시간을 초과하는 경우 (비정상적인 경우)
  if (diffMinutes > 24 * 60) {
    return "24시간 초과";
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
