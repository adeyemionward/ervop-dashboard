const generateAITasks = async () => {
  if (!projectTitle) {
    toast.error("Please enter a project title first!");
    return;
  }

  setLoadingAI(true);

  try {
    const res = await fetch("http://your-laravel-api.test/api/generate-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ projectTitle }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to generate AI tasks");

    setTasks(data.tasks.map((desc: string, idx: number) => ({
      id: Date.now() + idx,
      description: desc,
    })));

    toast.success("AI generated tasks!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to generate AI tasks.");
  } finally {
    setLoadingAI(false);
  }
};
