import {Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider, Text} from "@chakra-ui/react";
import {ReactNode} from "react";
import {Configs} from "../../services/ConfigsServices";
import {SimplifiedObject} from "../CertsForm";

interface Props {
    children: ReactNode;
    dataObject: Configs | SimplifiedObject;
}

const CardInfo = ({children, dataObject}: Props) => {
    return (
        <Box maxWidth="40%" margin="auto">
            <Card>
                <CardHeader>
                    <Heading size="md">{children}</Heading>
                </CardHeader>
                <CardBody>
                    <Stack divider={<StackDivider/>} spacing="4">
                        {Object.entries(dataObject).map(([key, value]) => (
                            <Box key={key}>
                                <Heading size="sm" textTransform="uppercase">
                                    {key}
                                </Heading>
                                <Text pt="2" fontSize="xs" whiteSpace="pre-line">
                                    {value}
                                </Text>
                            </Box>
                        ))}
                    </Stack>
                </CardBody>
            </Card>
        </Box>
    );
};

export default CardInfo;
