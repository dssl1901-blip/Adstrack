const MAX_CONCURRENT = 1;
let active = 0;
const queue = [];

function processQueue() {
  if (active >= MAX_CONCURRENT || queue.length === 0) return;
  const { task, resolve, reject } = queue.shift();
  active += 1;
  task()
    .then(resolve, reject)
    .finally(() => {
      active -= 1;
      processQueue();
    });
}

export function enqueue(task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    processQueue();
  });
}
