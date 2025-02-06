import Confetti from "react-confetti";

const FallingConfetti = () => {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000`}
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        numberOfPieces={200}
        recycle={false}
      />
    </div>
  );
};

export default FallingConfetti;
