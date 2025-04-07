import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { RootView } from '@/components/RootView';
import { Row } from '@/components/Row';
import { ThemedText } from '@/components/ThemedText';
import { useFetchQuery } from '@/hooks/useFetchQuery';
import { Colors } from '@/constants/Color';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
    basePokemonStats,
    capitalizeFirstLetter,
    formatSize,
    formatWeight,
    getPokemonArtwork,
} from '@/functions/pokemon';
import { Card } from '@/components/Card';
import { PokemonType } from '@/components/pokemon/PokemonType';
import { PokemonSpec } from '@/components/pokemon/PokemonSpec';
import { PokemonStat } from '@/components/pokemon/PokemonStat';
import { Audio } from 'expo-av';

export default function Pokemon() {
    const colors = useThemeColors();
    const params = useLocalSearchParams() as { id: string };
    const { data: pokemon } = useFetchQuery('/pokemon/[id]', { id: params.id });
    const id = parseInt(params.id, 10);
    const { data: species } = useFetchQuery('/pokemon-species/[id]', {
        id: params.id,
    });
    const maintType = pokemon?.types?.[0].type.name;
    const colorType = maintType ? Colors.type[maintType] : colors.tint;
    const types = pokemon?.types ?? [];
    const bio = species?.flavor_text_entries
        ?.find(({ language }) => language.name === 'en')
        ?.flavor_text.replaceAll('\n', '. ');
    const stats = pokemon?.stats ?? basePokemonStats;

    const onImagePress = async () => {
        const cry = pokemon?.cries.latest;
        if (!cry) {
            return;
        }
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: cry },
                { shouldPlay: true },
            );
            await sound.playAsync();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const onPrevious = () => {
        router.replace({
            pathname: '/pokemon/[id]',
            params: { id: Math.max(id - 1, 1) },
        });
    };

    const onNext = () => {
        router.replace({
            pathname: '/pokemon/[id]',
            params: { id: Math.min(id + 1, 151) },
        });
    };

    const isFirst = id === 1;
    const isLast = id === 151;

    return (
        <RootView backgrounColor={colorType}>
            <View>
                <Image
                    source={require('@/assets/images/pokeball_big.png')}
                    style={styles.pokeball}
                />
                <Row style={styles.header}>
                    <Pressable onPress={router.back}>
                        <Row gap={8}>
                            <Image
                                source={require('@/assets/images/back.png')}
                                width={32}
                                height={32}
                            />
                            <ThemedText
                                color="grayWhite"
                                variant="headline"
                                style={{ textTransform: 'capitalize' }}
                            >
                                {pokemon?.name}
                            </ThemedText>
                        </Row>
                    </Pressable>
                    <ThemedText color="grayWhite" variant="subtitle2">
                        #{params.id.padStart(3, '0')}
                    </ThemedText>
                </Row>

                <Card style={styles.card}>
                    <Row style={styles.imageRow}>
                        {isFirst ? (
                            <View style={{ width: 24, height: 24 }}></View>
                        ) : (
                            <Pressable onPress={onPrevious}>
                                <Image
                                    width={24}
                                    height={24}
                                    source={require('@/assets/images/left.png')}
                                />
                            </Pressable>
                        )}
                        <Pressable onPress={onImagePress}>
                            <Image
                                style={styles.artwork}
                                source={{
                                    uri: getPokemonArtwork(params.id),
                                }}
                                width={200}
                                height={200}
                            />
                        </Pressable>
                        {isLast ? (
                            <View style={{ width: 24, height: 24 }}></View>
                        ) : (
                            <Pressable onPress={onNext}>
                                <Image
                                    width={24}
                                    height={24}
                                    source={require('@/assets/images/right.png')}
                                />
                            </Pressable>
                        )}
                    </Row>
                    <Row gap={16} style={{ height: 20 }}>
                        {types.map((type) => (
                            <PokemonType
                                name={type.type.name}
                                key={type.type.name}
                            />
                        ))}
                    </Row>

                    {/* About */}
                    <ThemedText
                        variant="subtitle1"
                        style={{ color: colorType }}
                    >
                        About
                    </ThemedText>
                    <Row>
                        <PokemonSpec
                            style={{
                                borderStyle: 'solid',
                                borderRightWidth: 1,
                                borderColor: colors.grayLight,
                            }}
                            title={formatWeight(pokemon?.weight)}
                            description="Weight"
                            image={require('@/assets/images/weight.png')}
                        />
                        <PokemonSpec
                            style={{
                                borderStyle: 'solid',
                                borderRightWidth: 1,
                                borderColor: colors.grayLight,
                            }}
                            title={formatSize(pokemon?.height)}
                            description="Size"
                            image={require('@/assets/images/size.png')}
                        />
                        <PokemonSpec
                            title={pokemon?.moves
                                .slice(0, 2)
                                .map((m) => capitalizeFirstLetter(m.move.name))
                                .join('\n')}
                            description="Moves"
                        />
                    </Row>
                    <ThemedText>{bio}</ThemedText>

                    {/* Stats */}
                    <ThemedText
                        variant="subtitle1"
                        style={{ color: colorType }}
                    >
                        Base stats
                    </ThemedText>
                    <View style={{ alignSelf: 'stretch' }}>
                        {stats.map((stat) => (
                            <PokemonStat
                                key={stat.stat.name}
                                color={colorType}
                                name={stat.stat.name}
                                value={stat.base_stat}
                            />
                        ))}
                    </View>
                </Card>
            </View>
        </RootView>
    );
}

const styles = StyleSheet.create({
    header: {
        margin: 20,
        justifyContent: 'space-between',
    },
    pokeball: {
        opacity: 0.1,
        position: 'absolute',
        right: 8,
        top: 8,
    },
    imageRow: {
        position: 'absolute',
        top: -140,
        zIndex: 2,
        justifyContent: 'space-between',
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    artwork: {},
    card: {
        marginTop: 144,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        gap: 16,
        alignItems: 'center',
    },
});
