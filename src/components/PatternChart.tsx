"use client";

import { useState, useMemo } from "react";
import { ActivityRecord } from "../app/page";

type PatternChartProps = {
  activities: ActivityRecord[];
};

export default function PatternChart({ activities }: PatternChartProps) {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 4); // 최근 5일의 시작일
    return today.toISOString().split("T")[0];
  });

  // 5일간의 날짜 배열 생성
  const dateRange = useMemo(() => {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push({
        date: date.toISOString().split("T")[0],
        display: date
          .toLocaleDateString("ko-KR", {
            month: "numeric",
            day: "numeric",
            weekday: "short",
          })
          .replace(" ", "\n"), // 줄바꿈으로 더 컴팩트하게
      });
    }
    return dates;
  }, [startDate]);

  // 날짜별 활동 데이터 필터링 및 밤잠 처리
  const filteredActivities = useMemo(() => {
    const dateSet = new Set(dateRange.map((d) => d.date));
    const result: ActivityRecord[] = [];

    activities.forEach((activity) => {
      if (dateSet.has(activity.date)) {
        if (
          activity.type === "밤잠" &&
          activity.layDownTime &&
          activity.endTime
        ) {
          // 밤잠이 다음날로 넘어가는지 확인
          const layDownTime = activity.layDownTime;
          const endTime = activity.endTime;

          // 눕힌 시간이 기상 시간보다 늦으면 다음날로 넘어가는 것
          if (layDownTime > endTime) {
            // 첫 번째 부분: 눕힌 시간부터 23:59까지
            result.push({
              ...activity,
              startTime: activity.fallAsleepTime || layDownTime,
              endTime: "23:59",
            });

            // 두 번째 부분: 00:00부터 기상 시간까지 (다음날)
            const nextDate = new Date(activity.date);
            nextDate.setDate(nextDate.getDate() + 1);
            const nextDateString = nextDate.toISOString().split("T")[0];

            if (dateSet.has(nextDateString)) {
              result.push({
                ...activity,
                id: activity.id + "_next",
                date: nextDateString,
                startTime: "00:00",
                endTime: endTime,
              });
            }
          } else {
            // 같은 날 안에서 끝나는 경우
            result.push({
              ...activity,
              startTime: activity.fallAsleepTime || activity.startTime,
            });
          }
        } else {
          result.push(activity);
        }
      }
    });

    return result;
  }, [activities, dateRange]);

  // 활동 유형별 색상 정의
  const getActivityColor = (activity: ActivityRecord) => {
    if (activity.type === "밤잠") return "#1e3a8a";
    if (activity.type === "낮잠") return "#3b82f6";
    if (activity.type === "식사") {
      switch (activity.mealType) {
        case "모유":
          return "#f472b6";
        case "분유":
          return "#f97316";
        case "이유식":
          return "#22c55e";
        case "유아식":
          return "#15803d";
        default:
          return "#f472b6";
      }
    }
    return "#6b7280";
  };

  // 시간을 픽셀 위치로 변환 (24시간 = 480px 기준으로 더 작게)
  const timeToPixel = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return (hours * 60 + minutes) * (480 / 1440); // 480px / 24시간
  };

  // 활동 지속시간을 픽셀 높이로 변환
  const getActivityHeight = (activity: ActivityRecord) => {
    if (!activity.endTime) return 12; // 종료시간이 없으면 기본 높이

    const startMinutes = timeToPixel(activity.startTime) * 3; // 분 단위로 변환
    const endMinutes = timeToPixel(activity.endTime) * 3;

    let duration = endMinutes - startMinutes;
    if (duration <= 0) duration = 1440 + duration; // 다음날로 넘어가는 경우 처리

    return Math.max(duration * (480 / 1440), 6); // 최소 높이 6px
  };

  // 날짜 이동 함수 (1일씩)
  const moveDate = (direction: "prev" | "next") => {
    const current = new Date(startDate);
    current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
    setStartDate(current.toISOString().split("T")[0]);
  };

  // 빠른 선택 함수
  const setQuickDate = (type: "recent" | "thisWeek" | "lastWeek") => {
    const today = new Date();
    let newStart = new Date();

    switch (type) {
      case "recent":
        newStart.setDate(today.getDate() - 4);
        break;
      case "thisWeek":
        const dayOfWeek = today.getDay();
        newStart.setDate(today.getDate() - dayOfWeek);
        break;
      case "lastWeek":
        const lastWeekDay = today.getDay();
        newStart.setDate(today.getDate() - lastWeekDay - 7);
        break;
    }

    setStartDate(newStart.toISOString().split("T")[0]);
  };

  // 날짜별 요약 정보 계산
  const getDailySummary = (date: string) => {
    const dayActivities = filteredActivities.filter((a) => a.date === date);

    const sleepActivities = dayActivities.filter(
      (a) => a.type === "밤잠" || a.type === "낮잠"
    );
    const mealCount = dayActivities.filter((a) => a.type === "식사").length;

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
      mealCount,
    };
  };

  return (
    <div className="bg-white p-2 sm:p-4 md:p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-3">
          5일 일과 패턴
        </h2>

        {/* 날짜 선택 컨트롤 */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => moveDate("prev")}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
            >
              ← 전날
            </button>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            />
            <button
              onClick={() => moveDate("next")}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
            >
              다음날 →
            </button>
          </div>

          <div className="flex justify-center gap-1">
            <button
              onClick={() => setQuickDate("recent")}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
            >
              최근5일
            </button>
            <button
              onClick={() => setQuickDate("thisWeek")}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
            >
              이번주
            </button>
            <button
              onClick={() => setQuickDate("lastWeek")}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
            >
              지난주
            </button>
          </div>
        </div>

        {/* 범례 - 더 컴팩트하게 */}
        <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#1e3a8a] rounded"></div>
            <span>밤잠</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#3b82f6] rounded"></div>
            <span>낮잠</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#f472b6] rounded"></div>
            <span>모유</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#f97316] rounded"></div>
            <span>분유</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#22c55e] rounded"></div>
            <span>이유식</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#15803d] rounded"></div>
            <span>유아식</span>
          </div>
        </div>
      </div>

      {/* 차트 영역 - 모바일에 최적화 */}
      <div className="relative">
        <div className="flex">
          {/* 시간 축 (Y축) - 더 작게 */}
          <div className="w-8 flex-shrink-0">
            <div className="h-8"></div> {/* 헤더 공간 */}
            <div className="relative h-[480px]">
              {Array.from({ length: 13 }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 text-xs text-gray-500 text-right pr-1"
                  style={{ top: `${i * 40}px` }} // 2시간 간격으로 표시
                >
                  {(i * 2).toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>

          {/* 날짜별 컬럼 - 매우 컴팩트하게 */}
          {dateRange.map((dateInfo, dateIndex) => {
            const dayActivities = filteredActivities.filter(
              (a) => a.date === dateInfo.date
            );
            const summary = getDailySummary(dateInfo.date);

            return (
              <div
                key={dateInfo.date}
                className="flex-1 border-l border-gray-200"
              >
                {/* 날짜 헤더 - 2줄로 표시 */}
                <div className="h-8 bg-gray-50 flex items-center justify-center text-xs font-medium border-b px-1 leading-tight whitespace-pre-line text-center">
                  {dateInfo.display}
                </div>

                {/* 활동 차트 영역 */}
                <div className="relative h-[480px] bg-gray-50">
                  {/* 시간 구분선 - 2시간 간격 */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-gray-200"
                      style={{ top: `${i * 40}px` }}
                    />
                  ))}

                  {/* 활동 블록들 */}
                  {dayActivities.map((activity, activityIndex) => {
                    const top = timeToPixel(activity.startTime);
                    const height = getActivityHeight(activity);
                    const color = getActivityColor(activity);

                    return (
                      <div
                        key={activity.id}
                        className="absolute left-0.5 right-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 4)}px`, // 최소 높이 4px
                          backgroundColor: color,
                          zIndex: 10,
                        }}
                        title={`${activity.type}${
                          activity.mealType ? ` (${activity.mealType})` : ""
                        }\n${activity.startTime}${
                          activity.endTime ? ` - ${activity.endTime}` : ""
                        }\n${activity.notes}`}
                      >
                        {/* 텍스트는 높이가 충분할 때만 표시 */}
                        {height > 15 && (
                          <div className="text-xs text-white p-0.5 truncate">
                            {activity.type === "식사"
                              ? activity.mealType === "모유"
                                ? "모"
                                : activity.mealType === "분유"
                                ? "분"
                                : activity.mealType === "이유식"
                                ? "이유식"
                                : activity.mealType === "유아식"
                                ? "유아식"
                                : activity.mealType
                              : activity.type}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 일일 요약 */}
                <div className="p-1 sm:p-2 bg-white border-t text-xs">
                  <div>
                    💤 {summary.totalSleepHours}h {summary.totalSleepMinutes}m
                  </div>
                  <div>🍼 {summary.mealCount}회</div>
                  {summary.nightSleepStart && (
                    <div className="truncate">
                      🌙 {summary.nightSleepStart}-{summary.nightSleepEnd}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
