import ServerDown from "@/assets/server_down.svg";

const ServerNotFound = () => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ height: "calc(100vh - 10rem)" }}
    >
      <h1 className="text-4xl font-bold text-indigo-500">Server Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">
        We couldn't reach the Nephelios server. Please check the server health
        and try again.
      </p>
      <img
        src={ServerDown}
        alt="Server Not Found"
        className="mt-6 w-1/2 max-w-md"
      />
    </div>
  );
};

export default ServerNotFound;
