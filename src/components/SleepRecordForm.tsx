"use client";

import { useState } from "react";
import { SleepRecord } from "../app/page";

type SleepRecordFormProps = {
  onAddRecord: (record: SleepRecord) => void;
};

export default function SleepRecordForm({ onAddRecord }: SleepRecordFormProps) {
  const [layDownTime, setLayDownTime] = useState("");
  const [fallAsleepTime, setFallAsleepTime] = useState("");
  const [wakeUpTime, setWakeUpTime] = useState("");
  const [notes, setNotes] = useState(""); // 추가된 상태
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!layDownTime || !fallAsleepTime || !wakeUpTime) {
      alert("모든 시간을 입력해주세요.");
      return;
    }

    const newRecord: SleepRecord = {
      id: Date.now().toString(),
      layDownTime,
      fallAsleepTime,
      wakeUpTime,
      date,
      notes, // 추가된 필드
    };

    onAddRecord(newRecord);

    // 폼 초기화
    setLayDownTime("");
    setFallAsleepTime("");
    setWakeUpTime("");
    setNotes(""); // 비고란도 초기화
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">밤잠 기록하기</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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

        <div className="mb-4">
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

        <div className="mb-4">
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            3. 기상 시각
          </label>
          <input
            type="time"
            value={wakeUpTime}
            onChange={(e) => setWakeUpTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* 추가된 비고란 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            수면 기록 (아기 반응 및 양육자 대응)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md min-h-[120px]"
            placeholder="예: 아기띠하고 쪽쪽이주면서 재움, 잘자다가 수유하고 달래주다가 허그곰으로 재움, 수시로 깨서 쪽쪽이로 달래줌..."
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
