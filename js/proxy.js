window.addEventListener("message", (event) => {
  if (event.data.action === "sync") {
    sync(event.data.room_id);
  }
});

const sync = (roomId) => {
  const myid = CW.application.myId.userId.value;
  const language = CW.application.languageCode.value;
  const theme = document.body.classList.contains("light") ? "light" : "dark";
  const access_token =
    CW.application.domainAPIServiceContext.taskAPIService.apiClient.accessToken;

  const accountEntities =
    CW.application.domainServiceContext.userService.userRepository.entities;
  const accounts = Object.keys(accountEntities).reduce((acc, accountId) => {
    acc[accountId] = {
      aid: accountEntities[accountId].identity?.value,
      av: accountEntities[accountId].profile?.profileImage?.value,
      cwid: accountEntities[accountId].chatWorkId?.value?.value,
      dp: accountEntities[accountId].profile?.job?.department?.value,
      name: accountEntities[accountId].name?.value,
      nickname: accountEntities[accountId].nickname?.value?.value,
    };
    return acc;
  }, {});
  const teamEntities =
    CW.application.domainServiceContext.teamService.teamRepository.entities;
  const teams = Object.keys(teamEntities).reduce((acc, teamId) => {
    acc[teamId] = {
      id: teamEntities[teamId].identity?.value,
      name: teamEntities[teamId].name?.value,
    };
    return acc;
  }, {});
  const roomEntities =
    CW.application.domainServiceContext.roomService.roomRepository.entities;
  const rooms = Object.keys(roomEntities).reduce((acc, roomId) => {
    if (roomEntities[roomId].members) {
      acc[roomId] = roomEntities[roomId].members.map(
        (member) => member.userId.value
      );
    } else if (roomEntities[roomId].mate) {
      acc[roomId] = [roomEntities[roomId].mate.value];
    } else {
      acc[roomId] = [];
    }
    return acc;
  }, {});

  if (
    roomEntities[roomId].relatedTeams &&
    roomEntities[roomId].relatedTeams.value
  ) {
    const relatedTeams = roomEntities[roomId].relatedTeams.value;
    const teamEntities =
      CW.application.domainServiceContext.teamService.teamRepository.entities;
    const fetchMemberPromises = relatedTeams.map((relatedTeam) =>
      teamEntities[relatedTeam.identity.value].teamMembersEntity?.value
        ? Promise.resolve()
        : CW.application.applicationServiceContext.teamAdditionAreaService.fetchMember(
            relatedTeam.identity.value
          )
    );
    Promise.all(fetchMemberPromises).then((_values) => {
      const teamEntities =
        CW.application.domainServiceContext.teamService.teamRepository.entities;
      const teamMembers = relatedTeams.reduce((acc, relatedTeam) => {
        const teamId = relatedTeam.identity.value;
        if (teamEntities[teamId].teamMembersEntity.value) {
          acc[teamId] = teamEntities[
            teamId
          ].teamMembersEntity.value.teamMembers.map(
            (teamMember) => teamMember.identity.value
          );
        }
        return acc;
      }, {});
      window.postMessage({
        action: "synced",
        access_token: access_token,
        myid: myid,
        language: language,
        theme: theme,
        accounts: JSON.stringify(accounts),
        teams: JSON.stringify(teams),
        rooms: JSON.stringify(rooms),
        team_members: JSON.stringify(teamMembers),
      });
    });
  } else {
    window.postMessage({
      action: "synced",
      access_token: access_token,
      myid: myid,
      language: language,
      theme: theme,
      accounts: JSON.stringify(accounts),
      teams: JSON.stringify(teams),
      rooms: JSON.stringify(rooms),
      team_members: JSON.stringify({}),
    });
  }
};
