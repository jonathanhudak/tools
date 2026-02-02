// Standard Sokoban level format:
// # = wall, @ = player, $ = box, . = target, * = box on target, + = player on target

export interface Level {
  id: number;
  name: string;
  map: string;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "First Push",
    map: `
#####
#   #
# $.#
# @ #
#####
`.trim(),
  },
  {
    id: 2,
    name: "Two Boxes",
    map: `
######
#    #
# $$ #
# .. #
# @  #
######
`.trim(),
  },
  {
    id: 3,
    name: "Corner",
    map: `
#####
#.  #
#$$ #
#.@ #
#####
`.trim(),
  },
  {
    id: 4,
    name: "Line Up",
    map: `
#######
#     #
# $$$ #
# ... #
#  @  #
#######
`.trim(),
  },
  {
    id: 5,
    name: "L Shape",
    map: `
######
#    #
# $  #
##$  #
#.  ##
#. @#
#####
`.trim(),
  },
  {
    id: 6,
    name: "Corridor",
    map: `
########
#      #
# $ $  #
##.#.###
 # @ #
 #####
`.trim(),
  },
  {
    id: 7,
    name: "Two Rooms",
    map: `
#######
#  .  #
# # # #
#$ @ $#
# # # #
#  .  #
#######
`.trim(),
  },
  {
    id: 8,
    name: "Center",
    map: `
#######
#     #
# $.$ #
#  @  #
# $.$ #
#     #
#######
`.trim(),
  },
  {
    id: 9,
    name: "Snaking",
    map: `
########
#      #
#.$ $. #
## @ ###
#.$ $. #
#      #
########
`.trim(),
  },
  {
    id: 10,
    name: "The Cross",
    map: `
  ###
  #.#
###$###
#. @ .#
###$###
  #.#
  ###
`.trim(),
  },
];
