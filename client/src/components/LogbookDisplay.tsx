import { Icon } from "@iconify/react";
import { calculateDuration, formatLogbookDate, parseLogbook, type LogbookEntry } from "../shared/lib/logbook-utils";

interface LogbookDisplayProps {
  content: string;
  className?: string;
}

interface LogbookEntryProps {
  entry: LogbookEntry;
}

function LogbookEntryCard({ entry }: LogbookEntryProps) {
  if (entry.type === 'state-change') {
    const getStateColor = (state: string) => {
      switch (state) {
        case 'TODO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'DONE': return 'bg-green-100 text-green-800 border-green-200';
        case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
        case 'WAITING': return 'bg-purple-100 text-purple-800 border-purple-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="logbook-entry bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Icon 
                    icon="lucide:git-branch" 
                    className="text-indigo-600 w-4 h-4" 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {entry.fromState && (
                  <>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStateColor(entry.fromState)}`}>
                      {entry.fromState}
                    </span>
                    <Icon icon="lucide:arrow-right" className="text-slate-400 w-3 h-3" />
                  </>
                )}
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStateColor(entry.toState)}`}>
                  {entry.toState}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">
                {formatLogbookDate(entry.startDate).split(' ')[0]}
              </div>
              <div className="text-xs font-mono text-slate-600">
                {formatLogbookDate(entry.startDate).split(' ')[1]}
              </div>
            </div>
          </div>
          
          {entry.note && (
            <div className="text-sm text-slate-700 bg-white/80 p-3 rounded-md border border-slate-200 mt-3">
              <Icon icon="lucide:message-circle" className="inline w-3 h-3 mr-2 text-slate-400" />
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
    <div className="logbook-entry bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isOngoing ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <Icon 
                  icon={isOngoing ? "lucide:play-circle" : "lucide:clock"} 
                  className={`w-4 h-4 ${isOngoing ? 'text-green-600' : 'text-orange-600'}`} 
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
          <div className="text-right space-y-1">
            {duration && (
              <div className="flex items-center justify-end space-x-1">
                <Icon icon="lucide:timer" className="text-orange-600 w-3 h-3" />
                <span className="text-sm font-mono font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-md">
                  {duration}
                </span>
              </div>
            )}
            {isOngoing && (
              <div className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                進行中
              </div>
            )}
          </div>
        </div>
        
        {entry.note && (
          <div className="text-sm text-slate-700 bg-white/80 p-3 rounded-md border border-orange-200 mt-3">
            <Icon icon="lucide:message-circle" className="inline w-3 h-3 mr-2 text-slate-400" />
            {entry.note}
          </div>
        )}
      </div>
    </div>
  );
}

export function LogbookDisplay({ content, className = "" }: LogbookDisplayProps) {
  const entries = parseLogbook(content);
  
  if (entries.length === 0) {
    return null;
  }

  const clockEntries = entries.filter(entry => entry.type === 'clock');
  const stateEntries = entries.filter(entry => entry.type === 'state-change');
  
  const totalDuration = clockEntries
    .filter(entry => entry.endDate)
    .reduce((total, entry) => {
      const duration = entry.endDate!.getTime() - entry.startDate.getTime();
      return total + duration;
    }, 0);
    
  const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
  const ongoingCount = clockEntries.filter(entry => !entry.endDate).length;

  return (
    <div className={`logbook-display bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg border border-slate-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Icon icon="lucide:history" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                ログブック
              </h2>
              <p className="text-sm text-slate-600">
                {entries.length}件のアクティビティ
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-4">
            {stateEntries.length > 0 && (
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">状態変更</span>
                <span className="text-sm font-bold text-indigo-600">{stateEntries.length}</span>
              </div>
            )}
            {totalDuration > 0 && (
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">合計時間</span>
                <span className="text-sm font-bold text-orange-600">
                  {totalHours > 0 && `${totalHours}h `}{totalMinutes}m
                </span>
              </div>
            )}
            {ongoingCount > 0 && (
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-slate-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">進行中</span>
                <span className="text-sm font-bold text-green-600">{ongoingCount}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent"></div>
          
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={`${entry.startDate.toISOString()}-${index}`} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-4 top-6 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 bg-gradient-to-br from-slate-400 to-slate-500"></div>
                
                {/* Entry card */}
                <div className="ml-12">
                  <LogbookEntryCard entry={entry} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}