"use client";

import { useState } from "react";
import { ActivityRecord } from "../app/page";
import {
  calculateWakeTimes,
  ActivityWithWakeTime,
} from "../utils/wakeTimeCalculator";

type DailyActivityLogProps = {
  activities: ActivityRecord[];
  onUpdateActivity: (activity: ActivityRecord) => void;
  onDeleteActivity: (activityId: string) => void;
};

export default function DailyActivityLog({
  activities,
  onUpdateActivity,
  onDeleteActivity,
}: DailyActivityLogProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ActivityRecord | null>(null);

  // 깨시 계산이 포함된 활동 데이터
  const activitiesWithWakeTime = calculateWakeTimes(activities);

  // 선택된 날짜의 활동들 필터링 및 시간순 정렬
  const dayActivities = activitiesWithWakeTime
    .filter((activity) => activity.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 편집 시작
  const startEdit = (activity: ActivityWithWakeTime) => {
    setEditingId(activity.id);
    setEditForm({
      id: activity.id,
      type: activity.type,
      date: activity.date,
      startTime: activity.startTime,
      endTime: activity.endTime || "",
      duration: activity.duration || "",
      notes: activity.notes,
      layDownTime: activity.layDownTime || "",
      fallAsleepTime: activity.fallAsleepTime || "",
      mealType: activity.mealType,
      amount: activity.amount || "",
      milkAmount: activity.milkAmount || "",
      portionSize: activity.portionSize,
    });
  };

  // 편집 취소
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // 편집 저장
  const saveEdit = () => {
    if (editForm) {
      onUpdateActivity(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  // 삭제 확인
  const handleDelete = (activityId: string) => {
    if (confirm("이 활동을 삭제하시겠습니까?")) {
      onDeleteActivity(activityId);
    }
  };

  // 폼 필드 업데이트
  const updateEditForm = (field: keyof ActivityRecord, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

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
              className={`border rounded-lg p-4 transition-all ${
                editingId === activity.id
                  ? "border-purple-400 bg-purple-50 shadow-lg"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              {editingId === activity.id ? (
                // 편집 모드
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-800">
                      ✏️ 편집 중
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        취소
                      </button>
                    </div>
                  </div>

                  {/* 기본 정보 편집 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        활동 유형
                      </label>
                      <select
                        value={editForm?.type || ""}
                        onChange={(e) => updateEditForm("type", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="밤잠">밤잠</option>
                        <option value="낮잠">낮잠</option>
                        <option value="식사">식사</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작 시간
                      </label>
                      <input
                        type="time"
                        value={editForm?.startTime || ""}
                        onChange={(e) => updateEditForm("startTime", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        종료 시간
                      </label>
                      <input
                        type="time"
                        value={editForm?.endTime || ""}
                        onChange={(e) => updateEditForm("endTime", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* 수면 관련 필드 */}
                  {(editForm?.type === "밤잠" || editForm?.type === "낮잠") && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          눕힌 시각
                        </label>
                        <input
                          type="time"
                          value={editForm?.layDownTime || ""}
                          onChange={(e) => updateEditForm("layDownTime", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          입면 시각
                        </label>
                        <input
                          type="time"
                          value={editForm?.fallAsleepTime || ""}
                          onChange={(e) => updateEditForm("fallAsleepTime", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          소요시간
                        </label>
                        <input
                          type="text"
                          value={editForm?.duration || ""}
                          onChange={(e) => updateEditForm("duration", e.target.value)}
                          placeholder="예: 1시간 30분"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* 식사 관련 필드 */}
                  {editForm?.type === "식사" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          식사 유형
                        </label>
                        <select
                          value={editForm?.mealType || ""}
                          onChange={(e) => updateEditForm("mealType", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="모유">모유</option>
                          <option value="분유">분유</option>
                          <option value="이유식">이유식</option>
                          <option value="유아식">유아식</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          양
                        </label>
                        <input
                          type="text"
                          value={editForm?.amount || ""}
                          onChange={(e) => updateEditForm("amount", e.target.value)}
                          placeholder="예: 120mL"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      {editForm?.mealType === "유아식" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            섭취량
                          </label>
                          <select
                            value={editForm?.portionSize || ""}
                            onChange={(e) => updateEditForm("portionSize", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="전량">전량</option>
                            <option value="1/2">1/2</option>
                            <option value="1/3">1/3</option>
                            <option value="기타">기타</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 메모 편집 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      메모
                    </label>
                    <textarea
                      value={editForm?.notes || ""}
                      onChange={(e) => updateEditForm("notes", e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                      placeholder="활동에 대한 메모를 입력하세요..."
                    />
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getActivityIcon(activity)}</div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {getActivityTitle(activity)}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {activity.startTime}
                          {activity.endTime && ` - ${activity.endTime}`}
                          {activity.duration && ` (${activity.duration})`}
                        </span>
                      </div>
                      
                      {/* 편집/삭제 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(activity)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                        >
                          ✏️ 편집
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
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
                        {activity.portionSize && (
                          <div>섭취량: {activity.portionSize}</div>
                        )}
                        {activity.milkAmount && (
                          <div>우유량: {activity.milkAmount}</div>
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
