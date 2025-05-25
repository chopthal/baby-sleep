"use client";

import { useState } from "react";
import Image from "next/image";
import ActivityForm from "../components/ActivityForm";
import DailyActivityLog from "../components/DailyActivityLog";

// 활동 유형 정의
export type ActivityType = "밤잠" | "낮잠" | "식사" | "기타";

// 통합 활동 기록 타입
export type ActivityRecord = {
  id: string;
  type: ActivityType;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  notes: string;
  // 수면 관련 추가 필드
  layDownTime?: string;
  fallAsleepTime?: string;
  // 식사 관련 추가 필드
  mealType?: "모유" | "분유" | "이유식" | "유아식";
  amount?: string;
  milkAmount?: string; // 유아식일 때 우유량
  portionSize?: "전량" | "1/2" | "1/3" | "기타"; // 유아식일 때 섭취량
};
export default function Home() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  const addActivity = (activity: ActivityRecord) => {
    setActivities([...activities, activity]);
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="mb-8 p-6 bg-purple-50 rounded-lg">
        <h1 className="text-2xl font-bold text-purple-800 mb-4">
          올라의 꿀수면 프로젝트
        </h1>
        <p className="mb-2">안녕하세요. 올라입니다!</p>
        <p className="mb-2">우리 아기 상담을 맡게 되어 영광입니다.</p>
        <p className="mb-2">
          양육자님과 아기의 편안한 밤을 위해 최선을 다하겠습니다.
        </p>
        <p className="mb-2">
          일과는 상세히 기록해 주셔야 원활한 상담이 가능합니다.
        </p>
        <p>감사합니다:)</p>
      </div>

      <div className="mb-8">
        <h1 className="text-xl font-bold text-purple-800 mb-4">
          활동 기록하기
        </h1>
        <ActivityForm onAddActivity={addActivity} />
      </div>

      <div>
        <h1 className="text-xl font-bold text-purple-800 mb-4">
          일별 활동 기록
        </h1>
        <DailyActivityLog activities={activities} />
      </div>
    </main>
  );
}
