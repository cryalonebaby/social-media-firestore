const getAnotherId = (participants, currentEmail) => {
  participants = participants?.filter(user => user !== currentEmail)[0]
  return participants
}

export default getAnotherId