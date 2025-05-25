"use client";

import { useState, useMemo } from "react";
import { ActivityRecord } from "../app/page";

type DailyActivityLogProps = {
  activities: ActivityRecord[];
};

type GroupedActivities = {
  [date: string]: ActivityRecord[];
};

export default function DailyActivityLog({
  activities,
}: DailyActivityLogProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // 날짜별로 활동 그룹화 및 각 날짜 내에서 시간순 정렬
  const groupedActivities = useMemo(() => {
    const grouped: GroupedActivities = {};

    // 날짜별로 그룹화
    activities.forEach((activity) => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);
    });

    // 각 날짜 그룹 내에서 시간순 정렬
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        // 시작 시간으로 정렬
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return grouped;
  }, [activities]);

  // 날짜 목록을 최신순으로 정렬
  const sortedDates = useMemo(() => {
    return Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a));
  }, [groupedActivities]);

  // 날짜 토글 함수
  const toggleDate = (date: string) => {
    if (expandedDate === date) {
      setExpandedDate(null);
    } else {
      setExpandedDate(date);
    }
  };

  // 활동 상세 정보 토글 함수
  const toggleActivity = (activityId: string) => {
    if (expandedActivity === activityId) {
      setExpandedActivity(null);
    } else {
      setExpandedActivity(activityId);
    }
  };

  // 활동 유형에 따른 아이콘 및 색상
  const getActivityTypeStyle = (type: string) => {
    switch (type) {
      case "밤잠":
        return {
          icon: "🌙",
          bgColor: "bg-indigo-100",
          textColor: "text-indigo-800",
        };
      case "낮잠":
        return {
          icon: "😴",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
        };
      case "식사":
        return {
          icon: "🍽️",
          bgColor: "bg-pink-100",
          textColor: "text-pink-800",
        };
      default:
        return {
          icon: "📝",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  if (sortedDates.length === 0) {
    return <p className="text-gray-500 italic">아직 기록된 활동이 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date} className="border rounded-lg overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleDate(date)}
          >
            <h3 className="text-lg font-medium">{date}</h3>
            <button className="text-gray-500">
              {expandedDate === date ? "접기 ▲" : "펼치기 ▼"}
            </button>
          </div>

          {expandedDate === date && (
            <div className="p-4">
              <div className="space-y-3">
                {groupedActivities[date].map((activity) => {
                  const { icon, bgColor, textColor } = getActivityTypeStyle(
                    activity.type
                  );

                  return (
                    <div
                      key={activity.id}
                      className="border rounded-md overflow-hidden"
                    >
                      <div
                        className={`flex items-center p-3 ${bgColor} cursor-pointer`}
                        onClick={() => toggleActivity(activity.id)}
                      >
                        <span className="text-xl mr-2">{icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className={`font-medium ${textColor}`}>
                              {activity.type}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {formatTime(activity.startTime)}
                              {activity.endTime &&
                                ` - ${formatTime(activity.endTime)}`}
                              {activity.duration && ` (${activity.duration})`}
                            </span>
                          </div>

                          {/* 간략 정보 표시 */}
                          <div className="text-sm text-gray-600 mt-1">
                            {activity.type === "식사" && activity.mealType && (
                              <span>
                                {activity.mealType}
                                {activity.mealType === "유아식"
                                  ? ` - ${activity.portionSize}${
                                      activity.milkAmount
                                        ? `, 우유 ${activity.milkAmount}`
                                        : ""
                                    }`
                                  : activity.amount
                                  ? ` - ${activity.amount}`
                                  : ""}
                              </span>
                            )}
                            {(activity.type === "밤잠" ||
                              activity.type === "낮잠") && (
                              <span>
                                눕힌 시각:{" "}
                                {activity.layDownTime &&
                                  formatTime(activity.layDownTime)}
                                , 입면 시각:{" "}
                                {activity.fallAsleepTime &&
                                  formatTime(activity.fallAsleepTime)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 상세 정보 표시 */}
                      {expandedActivity === activity.id && activity.notes && (
                        <div className="p-3 bg-white border-t">
                          <h4 className="font-medium mb-1">상세 기록:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {activity.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
