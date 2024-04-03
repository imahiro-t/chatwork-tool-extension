chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "add_task") {
    const addTaskUrl = `https://${request.host}/gateway/add_task.php?myid=${request.myid}&room_id=${request.room_id}`;
    const task = request.task;
    const assign = request.assign;
    const limit_type = request.limit_type;
    const task_limit = request.task_limit;
    const formData = new FormData();
    formData.append(
      "pdata",
      JSON.stringify({
        _t: request.token,
        task: task,
        assign: assign,
        limit_type: limit_type,
        task_limit: task_limit,
      })
    );
    fetch(addTaskUrl, { method: "POST", body: formData }).then((response) => {
      new Response(response.body).text().then((text) => {
        const json = JSON.parse(text);
        sendResponse({
          result: JSON.stringify({ status: json.status }),
        });
      });
    });
  }
  return true;
});
