"use client";

const Page = () => {
  const initializeDababase = async () => {
    const response = await fetch("/settings/initialize-database", {
      method: "POST",
    });
    const text = await response.text();
    if (response.ok) {
      alert(`${text}`);
    } else {
      alert(`Database failed to initialize: ${text}`);
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
