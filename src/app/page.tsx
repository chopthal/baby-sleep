"use client";

import { useState } from "react";
import Image from "next/image";
import ActivityForm from "../components/ActivityForm";
import DailyActivityLog from "../components/DailyActivityLog";
import PatternChart from "../components/PatternChart";

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

// 더미 데이터 생성 함수
const generateDummyData = (): ActivityRecord[] => {
  const dummyData: ActivityRecord[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    let idCounter = 1;

    // 밤잠 (전날 밤부터 아침까지)
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "밤잠",
      date: dateString,
      startTime: "21:30",
      endTime: "06:30",
      duration: "9시간 0분",
      layDownTime: "21:00",
      fallAsleepTime: "21:30",
      notes: `${
        i === 0
          ? "어제보다 잘 잤어요. 중간에 한 번 깼지만 금방 다시 잠들었습니다."
          : i === 1
          ? "밤에 두 번 깨서 수유했습니다. 쪽쪽이로 달래서 재웠어요."
          : i === 2
          ? "잠들기까지 시간이 좀 걸렸지만 한번 자고나서는 쭉 잤습니다."
          : i === 3
          ? "새벽에 기저귀 갈아주고 다시 재웠습니다."
          : i === 4
          ? "평소보다 일찍 잠들었어요. 컨디션이 좋아보입니다."
          : i === 5
          ? "밤에 보채서 아기띠로 재웠습니다."
          : "첫날이라 적응하는 중입니다."
      }`,
    });

    // 아침 식사
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "식사",
      date: dateString,
      startTime: "07:00",
      endTime: "07:15",
      duration: "15분",
      mealType: "분유",
      amount: "120mL",
      notes: `${
        i % 3 === 0
          ? "잘 먹었어요. 트림도 잘 했습니다."
          : i % 3 === 1
          ? "평소보다 조금 적게 먹었지만 괜찮습니다."
          : "먹다가 잠깐 쉬었다가 다시 먹었어요."
      }`,
    });

    // 오전 낮잠
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "낮잠",
      date: dateString,
      startTime: "09:00",
      endTime: "10:30",
      duration: "1시간 30분",
      layDownTime: "08:45",
      fallAsleepTime: "09:00",
      notes: `${
        i % 2 === 0 ? "유모차에서 잘 잤어요." : "침대에서 편안하게 잤습니다."
      }`,
    });

    // 오전 간식 (모유)
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "식사",
      date: dateString,
      startTime: "11:00",
      endTime: "11:20",
      duration: "20분",
      mealType: "모유",
      amount: "100mL",
      notes: "왼쪽 10분, 오른쪽 10분 수유했습니다.",
    });

    // 점심 (이유식)
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "식사",
      date: dateString,
      startTime: "12:30",
      endTime: "13:00",
      duration: "30분",
      mealType: "이유식",
      amount: "80mL",
      notes: `${
        i % 4 === 0
          ? "새로운 재료를 시도했는데 잘 받아먹었어요."
          : i % 4 === 1
          ? "평소 좋아하는 메뉴라 잘 먹었습니다."
          : i % 4 === 2
          ? "조금 거부하다가 나중에는 잘 먹었어요."
          : "숟가락을 빼앗으려고 해서 재미있게 먹었습니다."
      }`,
    });

    // 오후 낮잠
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "낮잠",
      date: dateString,
      startTime: "14:30",
      endTime: "16:00",
      duration: "1시간 30분",
      layDownTime: "14:15",
      fallAsleepTime: "14:30",
      notes: `${
        i % 3 === 0
          ? "책 읽어주다가 잠들었어요."
          : i % 3 === 1
          ? "안아서 재웠습니다. 깊게 잤어요."
          : "음악 틀어주고 토닥토닥 해줬더니 잠들었습니다."
      }`,
    });

    // 오후 간식
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "식사",
      date: dateString,
      startTime: "16:30",
      endTime: "16:45",
      duration: "15분",
      mealType: "분유",
      amount: "100mL",
      notes: "간식으로 조금만 먹였어요.",
    });

    // 저녁 (유아식)
    if (i < 3) {
      // 최근 3일은 유아식 시도
      dummyData.push({
        id: `${dateString}-${idCounter++}`,
        type: "식사",
        date: dateString,
        startTime: "18:00",
        endTime: "18:30",
        duration: "30분",
        mealType: "유아식",
        amount: i === 0 ? "전량" : i === 1 ? "1/2" : "1/3",
        portionSize: i === 0 ? "전량" : i === 1 ? "1/2" : "1/3",
        milkAmount: "150mL",
        notes: `${
          i === 0
            ? "유아식을 완전히 다 먹었어요! 우유도 잘 마셨습니다."
            : i === 1
            ? "절반 정도 먹고 그만두었지만 우유는 다 마셨어요."
            : "아직 유아식에 적응 중이에요. 조금씩 늘려가고 있습니다."
        }`,
      });
    } else {
      dummyData.push({
        id: `${dateString}-${idCounter++}`,
        type: "식사",
        date: dateString,
        startTime: "18:00",
        endTime: "18:25",
        duration: "25분",
        mealType: "이유식",
        amount: "90mL",
        notes: "저녁 이유식 잘 먹었어요.",
      });
    }

    // 저녁 낮잠 (짧은 잠)
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "낮잠",
      date: dateString,
      startTime: "19:30",
      endTime: "20:00",
      duration: "30분",
      layDownTime: "19:25",
      fallAsleepTime: "19:30",
      notes: "저녁 전 짧은 잠. 밤잠 준비용입니다.",
    });

    // 밤 수유 (잠들기 전)
    dummyData.push({
      id: `${dateString}-${idCounter++}`,
      type: "식사",
      date: dateString,
      startTime: "20:30",
      endTime: "20:45",
      duration: "15분",
      mealType: "모유",
      amount: "80mL",
      notes: "잠들기 전 마지막 수유입니다.",
    });
  }

  return dummyData;
};

export default function Home() {
  const [activities, setActivities] = useState<ActivityRecord[]>(
    generateDummyData()
  );
  const [activeTab, setActiveTab] = useState<"record" | "log" | "pattern">(
    "record"
  );

  const addActivity = (activity: ActivityRecord) => {
    setActivities([...activities, activity]);
  };

  const updateActivity = (updatedActivity: ActivityRecord) => {
    setActivities(activities.map(activity => 
      activity.id === updatedActivity.id ? updatedActivity : activity
    ));
  };

  const deleteActivity = (activityId: string) => {
    setActivities(activities.filter(activity => activity.id !== activityId));
  };

  return (
    <main className="max-w-6xl mx-auto p-4">
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

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("record")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "record"
                ? "border-purple-600 text-purple-600 bg-purple-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📝 활동 기록하기
          </button>
          <button
            onClick={() => setActiveTab("log")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "log"
                ? "border-purple-600 text-purple-600 bg-purple-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📋 일별 기록 보기
          </button>
          <button
            onClick={() => setActiveTab("pattern")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "pattern"
                ? "border-purple-600 text-purple-600 bg-purple-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📊 패턴 분석
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[600px]">
        {activeTab === "record" && (
          <div>
            <h2 className="text-xl font-bold text-purple-800 mb-4">
              활동 기록하기
            </h2>
            <ActivityForm onAddActivity={addActivity} />
          </div>
        )}

        {activeTab === "log" && (
          <div>
            <h2 className="text-xl font-bold text-purple-800 mb-4">
              일별 활동 기록
            </h2>
            <DailyActivityLog 
              activities={activities} 
              onUpdateActivity={updateActivity}
              onDeleteActivity={deleteActivity}
            />
          </div>
        )}

        {activeTab === "pattern" && (
          <div>
            <PatternChart activities={activities} />
          </div>
        )}
      </div>
    </main>
  );
}
