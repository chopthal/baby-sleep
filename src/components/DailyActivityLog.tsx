"use client";

import { useState } from "react";
import { ActivityRecord } from "../app/page";
import {
  calculateWakeTimes,
  ActivityWithWakeTime,
} from "../utils/wakeTimeCalculator";

type DailyActivityLogProps = {
  activities: ActivityRecord[];
};

export default function DailyActivityLog({
  activities,
}: DailyActivityLogProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // 깨시 계산이 포함된 활동 데이터
  const activitiesWithWakeTime = calculateWakeTimes(activities);

  // 선택된 날짜의 활동들 필터링 및 시간순 정렬
  const dayActivities = activitiesWithWakeTime
    .filter((activity) => activity.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 활동 유형별 아이콘
  const getActivityIcon = (activity: ActivityWithWakeTime) => {
    if (activity.type === "밤잠") return "🌙";
    if (activity.type === "낮잠") return "😴";
    if (activity.type === "식사") {
      switch (activity.mealType) {
        case "모유":
          return "🤱";
        case "분유":
          return "🍼";
        case "이유식":
          return "🥄";
        case "유아식":
          return "🍽️";
        default:
          return "🍼";
      }
    }
    return "📝";
  };

  // 활동 제목 생성
  const getActivityTitle = (activity: ActivityWithWakeTime) => {
    if (activity.type === "식사") {
      return `${activity.mealType}`;
    }
    return activity.type;
  };

  // 날짜 이동
  const changeDate = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(
      currentDate.getDate() + (direction === "next" ? 1 : -1)
    );
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  // 날짜별 요약 정보
  const getDaySummary = () => {
    const sleepActivities = dayActivities.filter(
      (a) => a.type === "밤잠" || a.type === "낮잠"
    );
    const mealActivities = dayActivities.filter((a) => a.type === "식사");

    const totalSleepMinutes = sleepActivities.reduce((total, activity) => {
      if (activity.duration) {
        const match = activity.duration.match(/(\d+)시간\s*(\d+)분/);
        if (match) {
          return total + parseInt(match[1]) * 60 + parseInt(match[2]);
        }
      }
      return total;
    }, 0);

    return {
      totalSleepHours: Math.floor(totalSleepMinutes / 60),
      totalSleepMinutes: totalSleepMinutes % 60,
      sleepCount: sleepActivities.length,
      mealCount: mealActivities.length,
    };
  };

  const summary = getDaySummary();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* 날짜 선택 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeDate("prev")}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← 전날
        </button>

        <div className="text-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-lg font-bold text-purple-800 bg-transparent border-none text-center cursor-pointer"
          />
          <div className="text-sm text-gray-600">
            {new Date(selectedDate).toLocaleDateString("ko-KR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <button
          onClick={() => changeDate("next")}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          다음날 →
        </button>
      </div>

      {/* 하루 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-purple-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-800">
            {summary.totalSleepHours}h {summary.totalSleepMinutes}m
          </div>
          <div className="text-sm text-gray-600">총 수면시간</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-800">
            {summary.sleepCount}
          </div>
          <div className="text-sm text-gray-600">수면 횟수</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-800">
            {summary.mealCount}
          </div>
          <div className="text-sm text-gray-600">식사 횟수</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-800">
            {dayActivities.length}
          </div>
          <div className="text-sm text-gray-600">총 활동</div>
        </div>
      </div>

      {/* 활동 목록 */}
      <div className="space-y-4">
        {dayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            이 날짜에 기록된 활동이 없습니다.
          </div>
        ) : (
          dayActivities.map((activity) => (
            <div
              key={activity.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getActivityIcon(activity)}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {getActivityTitle(activity)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {activity.startTime}
                      {activity.endTime && ` - ${activity.endTime}`}
                      {activity.duration && ` (${activity.duration})`}
                    </span>
                  </div>

                  {/* 깨시 정보 표시 */}
                  {activity.previousWakeTime && (
                    <div className="mb-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block">
                      ⏰ 이전 깨시: {activity.previousWakeTime}
                    </div>
                  )}

                  {/* 수면 활동 상세 정보 */}
                  {(activity.type === "밤잠" || activity.type === "낮잠") && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                      {activity.layDownTime && (
                        <div>눕힌 시각: {activity.layDownTime}</div>
                      )}
                      {activity.fallAsleepTime && (
                        <div>입면 시각: {activity.fallAsleepTime}</div>
                      )}
                      {activity.endTime && (
                        <div>기상 시각: {activity.endTime}</div>
                      )}
                    </div>
                  )}

                  {/* 식사 활동 상세 정보 */}
                  {activity.type === "식사" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                      {activity.amount && <div>양: {activity.amount}</div>}
                      {activity.duration && (
                        <div>소요시간: {activity.duration}</div>
                      )}
                    </div>
                  )}

                  {/* 메모 */}
                  {activity.notes && (
                    <div className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      💭 {activity.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
