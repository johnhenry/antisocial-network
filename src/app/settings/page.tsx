"use client";

const Page = () => {
  const initializeDababase = async () => {
    const response = await fetch("/settings/init", { method: "POST" });
    if (response.ok) {
      alert("db initialized!");
    } else {
      alert(`db failed to initialize: ${await response.text()}`);
    }
  };
  return (
    <section>
      <h1>Settings</h1>
      <h2>Database</h2>
      <form>
        <button type="button" onClick={initializeDababase}>
          Initialize Database
        </button>
      </form>
      <hr />
    </section>
  );
};

export default Page;
