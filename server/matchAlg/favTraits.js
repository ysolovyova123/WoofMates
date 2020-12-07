const largestOption = (traitObj) => {
  //returns option with highest vote count for one trait
  let largest = 0;
  let trait = '';
  for (let elem in traitObj){
    if (traitObj[elem] > largest){
      largest = traitObj[elem]
      trait = elem;
    }
  }
  return trait
}

const favoriteTraits = (user) => {
  //Creates object with highest vote count
  let favTraits = {};
  let preferences = user.preference.dataValues
  for (let elem in preferences){
    if (elem === 'isNeuteredDealbreaker' || elem === 'distanceFromLocation' || elem === 'createdAt' || elem === 'updatedAt' || elem === 'id' || elem === 'userId'){continue;}
    favTraits[elem] = largestOption(preferences[elem])
  }
  return favTraits
}

module.exports = {favoriteTraits}