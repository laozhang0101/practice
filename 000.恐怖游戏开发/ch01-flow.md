# Chapter 01 Flow

## Chapter name

`第一章：回楼`

## Chapter purpose

- Establish the present-day return-home frame
- Introduce the primary location and late-winter Northeast atmosphere
- Seed the family's economic, medical, and emotional tensions
- Deliver the first clear memory bleed and end on the sister's accusation

## Player goal

Find the mother's housing papers and any clue pointing to where she went before the demolition crew seals the building.

## Unlock condition for chapter end

The player finds the cassette tape in the sister's room, restores power to the tape recorder, and listens to the final line.

## Required story flags

- `ch01_entered_building`
- `ch01_found_demolition_notice`
- `ch01_found_waiting_post_notice`
- `ch01_found_medical_file`
- `ch01_found_vocational_form`
- `ch01_power_restored`
- `ch01_found_cassette`
- `ch01_memory_bleed_started`
- `ch01_completed`

## Required interactable props

- Building entrance notice board
- Rusted unit mailbox
- Demolition notice
- Family photo on the living room wall
- Thermos bottle
- Father's waiting-post notice
- Mother's medical folder
- Kitchen fuse box or breaker
- Sister's origami cranes
- Cassette tape
- Tape recorder

## Flow table

| Step | Scene | Player objective | Trigger | Key interaction | Key props | Dialogue or subtitle | Output |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Exterior stair entrance | Enter the old building | Player reaches the sealed entrance and notices a side door left open | Push open warped metal door | Snow prints, broken seal strip, old building number plate | `这楼本该已经清空了。` | Set `ch01_entered_building` |
| 02 | First-floor corridor | Identify the correct unit and get context | Player approaches the notice board | Inspect demolition notice and resident list | Demolition notice, faded unit roster | `桦岭机械厂家属二区，限三日内完成搬离。` | Set `ch01_found_demolition_notice` |
| 03 | Stairwell | Reach the family's floor | Player climbs toward the third floor | Hear distant radio broadcast from nowhere | Heating pipes, cracked window, echoing loudspeaker | Factory broadcast mentions winter shift reductions | Build unease |
| 04 | Apartment doorway | Enter the family apartment | Player inspects the locked family door | Use spare key hidden above the meter box | Door charm remains, old lock, dust marks | `门口的灰被人动过。` | Open apartment |
| 05 | Living room | Search for mother's papers | Player steps inside the apartment | Inspect living room objects to infer time and class background | Family portrait, thermos, wall calendar, sofa cover | `照片里的人都在看着我。` | Open search loop |
| 06 | Living room side cabinet | Find the first hard clue | Player opens side cabinet drawer | Read demolition paperwork and missing-person note fragment | Utility receipts, handwritten note corner | `如果妈真回来过，她找的也一定是这些。` | Update objective to search bedrooms |
| 07 | Parents' bedroom | Search father's old files | Player inspects wardrobe and bedside cabinet | Pull out waiting-post notice from a folder | Waiting-post notice, factory badge, cigarettes | `程建国，锅炉班，待岗学习。` | Set `ch01_found_waiting_post_notice` |
| 08 | Parents' bedroom | Hint at father's hidden shame | Player lingers after finding the notice | Audio sting and brief visual overlap of 1997 room state | Folded uniform, oil-stained gloves | Off-screen male breath and a line: `先把这阵熬过去。` | First mild time bleed |
| 09 | Kitchen | Restore local power | Player tries the hallway light or tape recorder with no response | Solve a simple breaker puzzle by re-seating a tripped fuse | Fuse box, enamel basin, flashlight, melted wire smell | `又跳了。以前家里总这样。` | Set `ch01_power_restored` |
| 10 | Kitchen table | Discover the medical pressure | Restored light reveals a folder tucked under plastic tablecloth | Read the mother's medical file and payment slip | Medical folder, fee receipt, medicine bag | `先天性心脏病，建议转上级医院复查。` | Set `ch01_found_medical_file` |
| 11 | Corridor between rooms | Push the player toward the sister's room | After reading the medical file, a paper crane falls from the dark corridor | Follow faint rustling sound | Paper crane, cold draft, floor scuff marks | No direct line; let sound carry the beat | Transition cue |
| 12 | Sister's bedroom threshold | Establish emotional core | Player opens the half-stuck bedroom door | The room appears cleaner than the rest, as if recently used | Bed curtain, schoolbooks, paper cranes, hair ribbon | `这里不像空了十几年。` | Focus player attention |
| 13 | Sister's desk | Reveal sibling tension | Player inspects desk drawer | Find vocational school application with the protagonist's name | Vocational form, pen marks, corrected address | `推荐名额只有一个，过期不候。` | Set `ch01_found_vocational_form` |
| 14 | Sister's bed area | Find the cassette tape | Player examines pillow, toy tin, and bedside shelf | Recover a labeled cassette hidden in a candy tin | Cassette tape labeled `给哥` | `她那时候就知道我要走。` | Set `ch01_found_cassette` |
| 15 | Sister's desk or living room recorder | Play the tape | Player uses tape on recorder after restoring power | Start playback; screen space subtly shifts to 1997 state | Tape recorder, flickering lamp, room tone drop | Sister's voice begins calm, then breaks: `哥，你要是走了，就别说你不知道。` | Set `ch01_memory_bleed_started` |
| 16 | Full apartment memory overlap | End chapter on accusation | Tape reaches final line | Environment shifts: heating pipe knocks, corridor radio turns into past factory notice, bedroom door closes by itself | Audio-first scare, no enemy encounter | `1997 年 12 月 14 日，锅炉班夜班调整通知……` | Set `ch01_completed`; transition to Chapter 02 |

## Step notes

### 01 to 04: Return and entry

- No overt scare yet
- The building must feel recently abandoned, not ancient ruin
- Use snowmelt, dust disturbance, and residual warmth to imply someone may still come here

### 05 to 10: Search and pressure reveal

- The chapter's first half should layer class background through ordinary objects
- The waiting-post notice and medical file form the chapter's social reality spine
- Puzzle difficulty stays low; the breaker exists to vary rhythm and make the player touch the space

### 11 to 16: Emotional pivot

- The sister's room should feel preserved and therefore more disturbing
- The vocational form reframes the protagonist as a beneficiary of family resource allocation
- The cassette line is the first true hook that transforms the story from investigation into accusation

## Dialogue draft

### Optional protagonist barks

- `这地方比我记得的小。`
- `暖气早该停了。`
- `这些东西，她居然没扔。`
- `我以前不敢碰她屋里的东西。`

### Non-diegetic memory bleed lines

- Father: `先别往外说。`
- Mother: `等这次过去就好了。`
- Grandmother: `她这是撞着了，不是病。`

## Implementation notes

- Keep interaction count under 15 meaningful clicks before the tape reveal
- Use audio to carry most of the horror load in this chapter
- The first memory bleed should be readable as stress or suggestion, not confirmed supernatural truth
- Avoid a chase or fail state in Chapter 01

## Prototype checklist

- Graybox apartment with connected corridor
- Functional inspect interaction
- One simple fuse puzzle
- One cassette playback sequence
- One scene-state swap or prop-state swap for the final beat
