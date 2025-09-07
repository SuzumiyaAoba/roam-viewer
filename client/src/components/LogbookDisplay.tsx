import React from "react";
import { Icon } from "@iconify/react";
import {
  calculateDuration,
  formatLogbookDate,
  parseLogbook,
  type LogbookEntry,
} from "../shared/lib/logbook-utils";

interface LogbookDisplayProps {
  content: string;
  className?: string;
}

interface LogbookEntryProps {
  entry: LogbookEntry;
}

function LogbookEntryCard({ entry }: LogbookEntryProps) {
  if (entry.type === "state-change") {
    const getStateColor = (state: string) => {
      switch (state) {
        case "TODO":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "DONE":
          return "bg-green-100 text-green-800 border-green-200";
        case "CANCELLED":
          return "bg-red-100 text-red-800 border-red-200";
        case "WAITING":
          return "bg-purple-100 text-purple-800 border-purple-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <div className="logbook-entry bg-slate-50 border border-slate-200 rounded-md">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
                  <Icon icon="lucide:git-branch" className="text-slate-500 w-3 h-3" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {entry.fromState && (
                  <>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${getStateColor(entry.fromState)}`}
                    >
                      {entry.fromState}
                    </span>
                    <Icon icon="lucide:arrow-right" className="text-slate-400 w-3 h-3" />
                  </>
                )}
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium border ${getStateColor(entry.toState || "")}`}
                >
                  {entry.toState}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">{formatLogbookDate(entry.startDate)}</div>
            </div>
          </div>

          {entry.note && (
            <div className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-200 mt-3">
              {entry.note}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Clock entry
  const duration = entry.endDate ? calculateDuration(entry.startDate, entry.endDate) : null;
  const isOngoing = !entry.endDate;

  return (
    <div className="logbook-entry bg-orange-50 border border-orange-200 rounded-md">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${
                  isOngoing ? "bg-green-100" : "bg-orange-100"
                }`}
              >
                <Icon
                  icon={isOngoing ? "lucide:play-circle" : "lucide:clock"}
                  className={`w-3 h-3 ${isOngoing ? "text-green-600" : "text-orange-600"}`}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">開始</span>
                <span className="text-sm font-mono text-slate-700">
                  {formatLogbookDate(entry.startDate)}
                </span>
              </div>
              {entry.endDate && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-slate-500 font-medium">終了</span>
                  <span className="text-sm font-mono text-slate-700">
                    {formatLogbookDate(entry.endDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            {duration && <div className="text-xs text-orange-600">{duration}</div>}
            {isOngoing && <div className="text-xs text-green-600">進行中</div>}
          </div>
        </div>

        {entry.note && (
          <div className="text-sm text-slate-600 bg-white p-2 rounded border border-orange-200 mt-3">
            {entry.note}
          </div>
        )}
      </div>
    </div>
  );
}

export function LogbookDisplay({ content, className = "" }: LogbookDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const entries = parseLogbook(content);

  if (entries.length === 0) {
    return null;
  }

  const clockEntries = entries.filter((entry) => entry.type === "clock");
  const stateEntries = entries.filter((entry) => entry.type === "state-change");

  const totalDuration = clockEntries
    .filter((entry) => entry.endDate)
    .reduce((total, entry) => {
      const duration = (entry.endDate?.getTime() ?? 0) - entry.startDate.getTime();
      return total + duration;
    }, 0);

  const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));

  // 最新のエントリーを取得（状態変更を優先）
  const latestEntry = stateEntries[0] || entries[0];
  const displayEntries = isExpanded ? entries : [];

  // ステータス用カラー関数
  const getStateColor = (state: string) => {
    switch (state) {
      case "TODO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DONE":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "WAITING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`logbook-display ${className}`}>
      {/* 最新状態の表示 */}
      <button
        type="button"
        className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100 transition-colors w-full text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Icon
            icon={isExpanded ? "lucide:chevron-down" : "lucide:chevron-right"}
            className="text-slate-400 w-4 h-4"
          />
          {latestEntry && (
            latestEntry.type === "state-change" ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">最新状態:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getStateColor(latestEntry.toState || "")}`}
                >
                  {latestEntry.toState}
                </span>
              </div>
            ) : (
              <span className="text-sm text-slate-600">
                最新記録: {formatLogbookDate(latestEntry.startDate)}
              </span>
            )
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>{entries.length}件</span>
          {totalDuration > 0 && (
            <span>
              ({totalHours > 0 && `${totalHours}h `}
              {totalMinutes}m)
            </span>
          )}
        </div>
      </button>

      {/* 展開されたときの詳細表示 */}
      {isExpanded && (
        <div className="mt-2 bg-slate-50 rounded-lg border border-slate-200">
          <div className="p-3">
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-300"></div>

              <div className="space-y-3">
                {displayEntries.map((entry, index) => (
                  <div key={`${entry.startDate.toISOString()}-${index}`} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute left-2 top-3 w-2 h-2 rounded-full bg-slate-400"></div>

                    {/* Entry card */}
                    <div className="ml-6">
                      <LogbookEntryCard entry={entry} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
