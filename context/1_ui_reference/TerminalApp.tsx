import { useState, useEffect } from "react";
import { Clock, Plus, X, Bell, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Alarm {
  id: string;
  time: string;
  label: string;
  isActive: boolean;
}

interface Timer {
  id: string;
  duration: number; // in seconds
  remaining: number;
  label: string;
  isActive: boolean;
}

const TerminalApp = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState("");
  const [newAlarmLabel, setNewAlarmLabel] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState("");
  const [newTimerLabel, setNewTimerLabel] = useState("");

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(timer => {
        if (timer.isActive && timer.remaining > 0) {
          const newRemaining = timer.remaining - 1;
          if (newRemaining === 0) {
            alert(`⏰ Timer "${timer.label}" finished!`);
            return { ...timer, remaining: 0, isActive: false };
          }
          return { ...timer, remaining: newRemaining };
        }
        return timer;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addAlarm = () => {
    if (newAlarmTime && newAlarmLabel) {
      const newAlarm: Alarm = {
        id: Date.now().toString(),
        time: newAlarmTime,
        label: newAlarmLabel,
        isActive: true
      };
      setAlarms(prev => [...prev, newAlarm]);
      setNewAlarmTime("");
      setNewAlarmLabel("");
    }
  };

  const addTimer = () => {
    if (newTimerMinutes && newTimerLabel) {
      const duration = parseInt(newTimerMinutes) * 60;
      const newTimer: Timer = {
        id: Date.now().toString(),
        duration,
        remaining: duration,
        label: newTimerLabel,
        isActive: true
      };
      setTimers(prev => [...prev, newTimer]);
      setNewTimerMinutes("");
      setNewTimerLabel("");
    }
  };

  const removeAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSystemUptime = () => {
    const uptime = Math.floor(Date.now() / 1000) % (24 * 3600);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-terminal p-4 overflow-hidden relative max-w-[500px] mx-auto">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-px bg-primary/20 animate-scan-line"></div>
      </div>

      {/* Header */}
      <div className="border border-border p-2 mb-4 bg-card">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-primary">┌─[alarm@timer]─[~]</span>
            <span className="text-muted-foreground">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })} | {currentTime.toLocaleDateString()}
            </span>
          </div>
          <div className="text-accent">
            uptime: {getSystemUptime()}
          </div>
        </div>
      </div>

      {/* ASCII Art Display */}
      <div className="border border-border p-4 mb-6 bg-card">
        <div className="text-center font-mono text-xs text-primary">
          <div className="animate-pulse">
            ╔═══════════════════════════════════════╗<br/>
            ║    ⏰ ALARM & TIMER SYSTEM ⏲️         ║<br/>
            ║                                       ║<br/>
            ║  ████████████████████████████████████ ║<br/>
            ║  █ Active: {(alarms.length + timers.length).toString().padStart(2, '0')} tasks running █████████████ ║<br/>
            ║  ████████████████████████████████████ ║<br/>
            ║                                       ║<br/>
            ╚═══════════════════════════════════════╝
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alarms Section */}
        <div className="border border-border bg-card">
          <div className="border-b border-border p-3 bg-secondary">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-primary font-bold">ALARMS</span>
              <span className="text-muted-foreground text-sm">({alarms.length})</span>
            </div>
          </div>
          
          <div className="p-4">
            {/* Add Alarm Form */}
            <div className="mb-4 space-y-2">
              <div className="text-xs text-accent mb-2">└─ Add new alarm:</div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  type="time"
                  value={newAlarmTime}
                  onChange={(e) => setNewAlarmTime(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm"
                  placeholder="HH:MM"
                  step="60"
                />
                <Input
                  type="text"
                  value={newAlarmLabel}
                  onChange={(e) => setNewAlarmLabel(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm"
                  placeholder="Label"
                />
                <Button 
                  onClick={addAlarm}
                  variant="outline"
                  size="sm"
                  className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Alarms List */}
            <div className="space-y-1">
              {alarms.length === 0 ? (
                <div className="text-muted-foreground text-sm py-4 text-center">
                  No alarms configured
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div key={alarm.id} className="flex items-center justify-between p-2 border border-border/50 bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="font-mono text-sm">{alarm.time}</span>
                      <span className="text-sm text-muted-foreground">{alarm.label}</span>
                      {alarm.isActive && (
                        <span className="w-2 h-2 bg-primary rounded-full animate-blink"></span>
                      )}
                    </div>
                    <Button
                      onClick={() => removeAlarm(alarm.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timers Section */}
        <div className="border border-border bg-card">
          <div className="border-b border-border p-3 bg-secondary">
            <div className="flex items-center space-x-2">
              <TimerIcon className="w-4 h-4 text-primary" />
              <span className="text-primary font-bold">TIMERS</span>
              <span className="text-muted-foreground text-sm">({timers.length})</span>
            </div>
          </div>
          
          <div className="p-4">
            {/* Add Timer Form */}
            <div className="mb-4 space-y-2">
              <div className="text-xs text-accent mb-2">└─ Add new timer:</div>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={newTimerMinutes}
                  onChange={(e) => setNewTimerMinutes(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm flex-1"
                  placeholder="Minutes"
                  min="1"
                />
                <Input
                  type="text"
                  value={newTimerLabel}
                  onChange={(e) => setNewTimerLabel(e.target.value)}
                  className="bg-input border-border text-foreground font-mono text-sm flex-1"
                  placeholder="Label"
                />
                <Button 
                  onClick={addTimer}
                  variant="outline"
                  size="sm"
                  className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Timers List */}
            <div className="space-y-1">
              {timers.length === 0 ? (
                <div className="text-muted-foreground text-sm py-4 text-center">
                  No timers running
                </div>
              ) : (
                timers.map((timer) => (
                  <div key={timer.id} className="flex items-center justify-between p-2 border border-border/50 bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <TimerIcon className="w-4 h-4 text-accent" />
                      <span className="font-mono text-sm font-bold">
                        {formatTime(timer.remaining)}
                      </span>
                      <span className="text-sm text-muted-foreground">{timer.label}</span>
                      {timer.isActive && timer.remaining > 0 && (
                        <span className="w-2 h-2 bg-primary rounded-full animate-blink"></span>
                      )}
                      {timer.remaining === 0 && (
                        <span className="text-xs text-destructive">FINISHED</span>
                      )}
                    </div>
                    <Button
                      onClick={() => removeTimer(timer.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-border pt-4">
        <div className="text-xs text-muted-foreground text-center">
          <span className="text-primary">Alarm & Timer</span> v1.0.0 | Chrome Extension Proof of Concept
        </div>
      </div>
    </div>
  );
};

export default TerminalApp;