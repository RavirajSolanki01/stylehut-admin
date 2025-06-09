import React, { useState, useEffect } from "react";

interface IOtpTimerProps {
  otpLimitExpiry: string;
}

type TimeUnit = "minutes" | "seconds";

const timeUnits: TimeUnit[] = ["minutes", "seconds"];

const OtpTimer = ({ otpLimitExpiry }: IOtpTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    if (!otpLimitExpiry) {
      setTimeLeft({
        minutes: "00",
        seconds: "00",
      });
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(otpLimitExpiry).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({
          minutes: "00",
          seconds: "00",
        });
        return;
      }
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpLimitExpiry]);

  return (
    <>
      <div className="flex w-full items-center justify-center gap-6">
        {timeUnits.map((unit) => (
          <div key={unit}>
            <div className="before:contents-[''] relative w-max bg-indigo-50 px-[8px] before:absolute before:left-1/2 before:top-0 before:z-10 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-white">
              <h3
                className={`${unit} font-manrope relative z-20 max-w-[44px] text-center text-2xl font-semibold tracking-[15.36px] text-indigo-600`}
              >
                {timeLeft[unit]}
              </h3>
            </div>
            <p className="mt-1 w-full text-center text-sm font-normal text-gray-900">
              {unit}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex w-full items-center justify-center">
        <p className="rounded-m p-1 px-2 text-center text-sm text-indigo-600">
          You can request a new OTP once the timer ends.
        </p>
      </div>
    </>
  );
};

export default OtpTimer;
