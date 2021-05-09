const run = async () => {
  const world = await new Promise((resolve) => {
    resolve("world!");
  });

  console.log(`hello ${world}`);
};

run();
