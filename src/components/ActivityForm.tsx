"use client";

import { useState } from "react";
import { ActivityRecord, ActivityType } from "../app/page";

type ActivityFormProps = {
  onAddActivity: (activity: ActivityRecord) => void;
};

export default function ActivityForm({ onAddActivity }: ActivityFormProps) {
  const [type, setType] = useState<ActivityType>("밤잠");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  // 수면 관련 필드
  const [layDownTime, setLayDownTime] = useState("");
  const [fallAsleepTime, setFallAsleepTime] = useState("");

  // 식사 관련 필드
  const [mealType, setMealType] = useState<
    "모유" | "분유" | "이유식" | "유아식"
  >("모유");
  const [amount, setAmount] = useState("120"); // 기본값 설정
  const [milkAmount, setMilkAmount] = useState("180"); // 유아식일 때 우유량 기본값
  const [portionSize, setPortionSize] = useState<
    "전량" | "1/2" | "1/3" | "기타"
  >("전량"); // 유아식일 때 섭취량

  // 식사 유형에 따른 기본 섭취량 설정
  const getDefaultAmount = (type: string) => {
    switch (type) {
      case "모유":
        return "120";
      case "분유":
        return "120";
      case "이유식":
        return "100";
      default:
        return "0";
    }
  };

  // 식사 유형 변경 시 기본값 설정
  const handleMealTypeChange = (
    newType: "모유" | "분유" | "이유식" | "유아식"
  ) => {
    setMealType(newType);
    if (newType !== "유아식") {
      setAmount(getDefaultAmount(newType));
    }
  };

  // 수량 증감 함수
  const incrementAmount = () => {
    setAmount((prev) => (parseInt(prev) + 1).toString());
  };

  const decrementAmount = () => {
    setAmount((prev) => Math.max(0, parseInt(prev) - 1).toString());
  };

  const incrementMilkAmount = () => {
    setMilkAmount((prev) => (parseInt(prev) + 1).toString());
  };

  const decrementMilkAmount = () => {
    setMilkAmount((prev) => Math.max(0, parseInt(prev) - 1).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!(type === "밤잠" || type === "낮잠") && !startTime) {
      alert("시작 시간은 필수입니다.");
      return;
    }

    // 활동 유형에 따라 필수 필드 검증
    if (
      (type === "밤잠" || type === "낮잠") &&
      (!layDownTime || !fallAsleepTime || !endTime)
    ) {
      alert("수면 기록에는 눕힌 시각, 입면 시각, 기상 시각이 필요합니다.");
      return;
    }

    if (type === "식사" && !mealType) {
      alert("식사 유형을 선택해주세요.");
      return;
    }

    // 모유의 경우에만 종료 시간 필수
    if (type === "식사" && mealType === "모유" && !endTime) {
      alert("모유 수유의 경우 종료 시각이 필요합니다.");
      return;
    }

    // 기본 활동 기록 생성
    const newActivity: ActivityRecord = {
      id: Date.now().toString(),
      type,
      date,
      startTime:
        type === "밤잠" || type === "낮잠" ? fallAsleepTime : startTime,
      notes,
    };

    // 활동 유형에 따라 추가 필드 설정
    if (type === "밤잠" || type === "낮잠") {
      newActivity.layDownTime = layDownTime;
      newActivity.fallAsleepTime = fallAsleepTime;
      newActivity.endTime = endTime;

      // 입면 소요 시간 계산
      const layDownDate = new Date(`2000-01-01T${layDownTime}`);
      let fallAsleepDate = new Date(`2000-01-01T${fallAsleepTime}`);

      if (fallAsleepDate < layDownDate) {
        fallAsleepDate = new Date(`2000-01-02T${fallAsleepTime}`);
      }

      const diffMs = fallAsleepDate.getTime() - layDownDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // 총 수면 시간 계산
      const wakeUpDate = new Date(`2000-01-01T${endTime}`);
      let sleepDiffMs = wakeUpDate.getTime() - fallAsleepDate.getTime();

      if (wakeUpDate < fallAsleepDate) {
        sleepDiffMs =
          new Date(`2000-01-02T${endTime}`).getTime() -
          fallAsleepDate.getTime();
      }

      const sleepDiffMins = Math.floor(sleepDiffMs / 60000);

      newActivity.duration = `${Math.floor(sleepDiffMins / 60)}시간 ${
        sleepDiffMins % 60
      }분`;
    }

    if (type === "식사") {
      newActivity.mealType = mealType;

      if (mealType === "유아식") {
        newActivity.portionSize = portionSize;
        newActivity.milkAmount = `${milkAmount}mL`;
        newActivity.amount = portionSize;
      } else {
        newActivity.amount = `${amount}mL`;
      }

      // 종료 시간이 입력된 경우에만 duration 계산
      if (endTime) {
        newActivity.endTime = endTime;

        // 식사 시간 계산
        const startDate = new Date(`2000-01-01T${startTime}`);
        let endDate = new Date(`2000-01-01T${endTime}`);

        if (endDate < startDate) {
          endDate = new Date(`2000-01-02T${endTime}`);
        }

        const diffMs = endDate.getTime() - startDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        newActivity.duration = `${diffMins}분`;
      }
    }

    onAddActivity(newActivity);

    // 폼 초기화
    resetForm();
  };

  const resetForm = () => {
    if (!(type === "밤잠" || type === "낮잠")) {
      setStartTime("");
    }
    setEndTime("");
    setNotes("");
    setLayDownTime("");
    setFallAsleepTime("");

    // 식사 관련 필드 초기화 (기본값으로)
    if (type === "식사") {
      if (mealType !== "유아식") {
        setAmount(getDefaultAmount(mealType));
      } else {
        setPortionSize("전량");
        setMilkAmount("180");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              활동 유형
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="밤잠">밤잠</option>
              <option value="낮잠">낮잠</option>
              <option value="식사">식사</option>
              <option value="기타">기타 활동</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* 기본 시간 필드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 시작 시각 필드 - 수면 활동이 아닐 때만 표시 */}
          {!(type === "밤잠" || type === "낮잠") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === "식사" ? "식사 시작 시각" : "시작 시각"}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          )}

          {/* 종료 시각 필드 - 수면 활동이 아닐 때만 표시 */}
          {!(type === "밤잠" || type === "낮잠") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === "식사"
                  ? mealType === "모유"
                    ? "수유 종료 시각 (필수)"
                    : "식사 종료 시각 (선택)"
                  : "종료 시각"}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required={type === "식사" && mealType === "모유"}
              />
            </div>
          )}
        </div>
        {/* 수면 관련 필드 */}
        {(type === "밤잠" || type === "낮잠") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1. 눕힌 시각
              </label>
              <input
                type="time"
                value={layDownTime}
                onChange={(e) => setLayDownTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2. 입면 시각
              </label>
              <input
                type="time"
                value={fallAsleepTime}
                onChange={(e) => setFallAsleepTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3. 기상 시각
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        )}

        {/* 식사 관련 추가 필드 */}
        {type === "식사" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                식사 유형
              </label>
              <select
                value={mealType}
                onChange={(e) =>
                  handleMealTypeChange(
                    e.target.value as "모유" | "분유" | "이유식" | "유아식"
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="모유">모유</option>
                <option value="분유">분유</option>
                <option value="이유식">이유식</option>
                <option value="유아식">유아식</option>
              </select>
            </div>

            {/* 유아식이 아닌 경우 mL 단위 입력 */}
            {mealType !== "유아식" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  섭취량 (mL)
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={decrementAmount}
                    className="px-3 py-1 bg-gray-200 rounded-l-md"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 p-2 border-t border-b border-gray-300 text-center"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={incrementAmount}
                    className="px-3 py-1 bg-gray-200 rounded-r-md"
                  >
                    +
                  </button>
                  <span className="ml-2">mL</span>
                </div>
              </div>
            )}

            {/* 유아식인 경우 섭취량 선택 및 우유량 입력 */}
            {mealType === "유아식" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    섭취량
                  </label>
                  <select
                    value={portionSize}
                    onChange={(e) =>
                      setPortionSize(
                        e.target.value as "전량" | "1/2" | "1/3" | "기타"
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="전량">전량</option>
                    <option value="1/2">1/2</option>
                    <option value="1/3">1/3</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우유량 (mL)
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={decrementMilkAmount}
                      className="px-3 py-1 bg-gray-200 rounded-l-md"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={milkAmount}
                      onChange={(e) => setMilkAmount(e.target.value)}
                      className="flex-1 p-2 border-t border-b border-gray-300 text-center"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={incrementMilkAmount}
                      className="px-3 py-1 bg-gray-200 rounded-r-md"
                    >
                      +
                    </button>
                    <span className="ml-2">mL</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* 비고란 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {type === "밤잠" || type === "낮잠"
              ? "수면 기록 (아기 반응 및 양육자 대응)"
              : type === "식사"
              ? "식사 관련 메모"
              : "활동 메모"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md min-h-[120px]"
            placeholder={
              type === "밤잠" || type === "낮잠"
                ? "예: 아기띠하고 쪽쪽이주면서 재움, 잘자다가 수유하고 달래주다가 허그곰으로 재움..."
                : type === "식사"
                ? "예: 잘 먹음, 토함, 보챔..."
                : "활동에 대한 메모를 입력하세요."
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
        >
          기록 저장하기
        </button>
      </form>
    </div>
  );
}
