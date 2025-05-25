"use client";

import { SleepRecord } from "../app/page";
import { useState } from "react";

type SleepRecordDisplayProps = {
  records: SleepRecord[];
};

export default function SleepRecordDisplay({
  records,
}: SleepRecordDisplayProps) {
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // 입면 시간 계산 함수
  const calculateFallAsleepDuration = (layDown: string, fallAsleep: string) => {
    const layDownDate = new Date(`2000-01-01T${layDown}`);
    let fallAsleepDate = new Date(`2000-01-01T${fallAsleep}`);

    // 다음날로 넘어간 경우 (예: 눕힌 시각 21:00, 입면 시각 00:30)
    if (fallAsleepDate < layDownDate) {
      fallAsleepDate = new Date(`2000-01-02T${fallAsleep}`);
    }

    const diffMs = fallAsleepDate.getTime() - layDownDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    return `${Math.floor(diffMins / 60)}시간 ${diffMins % 60}분`;
  };

  // 총 수면 시간 계산 함수
  const calculateTotalSleepDuration = (fallAsleep: string, wakeUp: string) => {
    const fallAsleepDate = new Date(`2000-01-01T${fallAsleep}`);
    let wakeUpDate = new Date(`2000-01-01T${wakeUp}`);

    // 다음날로 넘어간 경우
    if (wakeUpDate < fallAsleepDate) {
      wakeUpDate = new Date(`2000-01-02T${wakeUp}`);
    }

    const diffMs = wakeUpDate.getTime() - fallAsleepDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    return `${Math.floor(diffMins / 60)}시간 ${diffMins % 60}분`;
  };

  // 비고란 토글 함수
  const toggleNotes = (recordId: string) => {
    if (expandedRecord === recordId) {
      setExpandedRecord(null);
    } else {
      setExpandedRecord(recordId);
    }
  };

  if (records.length === 0) {
    return (
      <p className="text-gray-500 italic">
        아직 기록된 수면 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">기록된 밤잠</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">날짜</th>
              <th className="py-2 px-4 border-b">눕힌 시각</th>
              <th className="py-2 px-4 border-b">입면 시각</th>
              <th className="py-2 px-4 border-b">기상 시각</th>
              <th className="py-2 px-4 border-b">입면 소요 시간</th>
              <th className="py-2 px-4 border-b">총 수면 시간</th>
              <th className="py-2 px-4 border-b">비고</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <>
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{record.date}</td>
                  <td className="py-2 px-4 border-b">{record.layDownTime}</td>
                  <td className="py-2 px-4 border-b">
                    {record.fallAsleepTime}
                  </td>
                  <td className="py-2 px-4 border-b">{record.wakeUpTime}</td>
                  <td className="py-2 px-4 border-b">
                    {calculateFallAsleepDuration(
                      record.layDownTime,
                      record.fallAsleepTime
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {calculateTotalSleepDuration(
                      record.fallAsleepTime,
                      record.wakeUpTime
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => toggleNotes(record.id)}
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      {expandedRecord === record.id ? "접기" : "보기"}
                    </button>
                  </td>
                </tr>
                {expandedRecord === record.id && (
                  <tr>
                    <td colSpan={7} className="py-3 px-4 border-b bg-purple-50">
                      <div className="whitespace-pre-wrap">
                        <strong>수면 기록 (아기 반응 및 양육자 대응):</strong>
                        <p className="mt-1">
                          {record.notes || "기록된 내용이 없습니다."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
