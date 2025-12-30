import { Box, Text } from "ink";
import { colors } from "@/theme.js";



const FRAME = String.raw`
㇄闩乙ㄚ ᗪ㠪ᐯ
.◜◝--◜◝　　 ｡ﾟﾟ･｡･ﾟﾟ。
(。•ㅅ•  )つ━✩ ･  *。
⊂   　 ノ 　　　･°
  しㅡＪ　　　°。+ * 。
　　　　　　　　　. ･°
　　　　　　　　　° ｡ﾟ ﾟ･｡･ﾟ ﾟ。
　　　　　　　　　　ﾟ。   　  ｡ﾟ
　　　　　　　　　　　ﾟ･｡･ﾟ
`;

export default function AnimatedDancingCat() {


  return (
    <Box
      justifyContent="center"
      alignItems="center"
    >
      <Text color={colors.primary}>
        {FRAME}
      </Text>
    </Box>
  );
}
