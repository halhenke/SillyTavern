export function prependUserPromptBias(message, {
    includeUserPromptBias,
    userPromptBias,
    isImpersonate,
    isContinue,
    substituteParams,
}) {
    if (!includeUserPromptBias || !userPromptBias || isImpersonate || isContinue || userPromptBias.length === 0) {
        return message;
    }

    return substituteParams(userPromptBias) + message;
}

export function trimPartialStoppingStrings(message, stoppingStrings = []) {
    let output = message;

    for (const stoppingString of stoppingStrings) {
        if (!stoppingString.length) {
            continue;
        }

        for (let j = stoppingString.length; j > 0; j--) {
            if (output.slice(-j) === stoppingString.slice(0, j)) {
                output = output.slice(0, -j);
                break;
            }
        }
    }

    return output;
}

export function trimWrongSpeakerContent(message, wrongName) {
    if (!wrongName) {
        return message;
    }

    let output = message;
    let startIndex = output.indexOf(`${wrongName}:`);
    if (startIndex === 0) {
        return '';
    }

    startIndex = output.indexOf(`\n${wrongName}:`);
    if (startIndex >= 0) {
        output = output.substring(0, startIndex);
    }

    return output;
}

export function trimInstructSequences(message, {
    isInstruct,
    stopSequence,
    inputSequence,
    outputSequence,
    lastOutputSequence,
    sequencesAsStopStrings,
    isImpersonate,
}) {
    if (!isInstruct) {
        return message;
    }

    const isNotEmpty = (str) => str && str.trim() !== '';
    let output = message;

    if (stopSequence && output.indexOf(stopSequence) !== -1) {
        output = output.substring(0, output.indexOf(stopSequence));
    }

    if (isNotEmpty(inputSequence) && output.indexOf(inputSequence) !== -1) {
        output = output.substring(0, output.indexOf(inputSequence));
    }

    if (sequencesAsStopStrings) {
        const sequences = [
            { value: inputSequence, apply: isImpersonate && isNotEmpty(inputSequence) },
            { value: outputSequence, apply: !isImpersonate && isNotEmpty(outputSequence) },
            { value: lastOutputSequence, apply: !isImpersonate && isNotEmpty(lastOutputSequence) },
        ];

        for (const seq of sequences.filter(s => s.apply)) {
            seq.value
                .split('\n')
                .filter(line => line.trim() !== '')
                .forEach(line => {
                    output = output.replaceAll(line, '');
                });
        }
    }

    return output;
}

export function trimGroupMemberPrefixes(message, {
    selectedGroup,
    groups,
    characters,
    activeCharacterName,
    disableGroupTrimming,
    escapeRegex,
}) {
    if (!selectedGroup || disableGroupTrimming) {
        return message;
    }

    const group = groups.find((x) => x.id == selectedGroup);
    if (!group || !Array.isArray(group.members) || !group.members) {
        return message;
    }

    let output = message;
    for (const member of group.members) {
        const character = characters.find(x => x.avatar == member);
        if (!character) {
            continue;
        }

        const name = character.name;
        if (name === activeCharacterName) {
            continue;
        }

        const regex = new RegExp(`(^|\\n)${escapeRegex(name)}:`);
        const nameMatch = output.match(regex);
        if (nameMatch) {
            output = output.substring(0, nameMatch.index);
        }
    }

    return output;
}

export function trimLeadingDisplayName(message, displayName) {
    if (!displayName || !message.startsWith(`${displayName}:`)) {
        return message;
    }

    return message.replace(`${displayName}:`, '').trimStart();
}
