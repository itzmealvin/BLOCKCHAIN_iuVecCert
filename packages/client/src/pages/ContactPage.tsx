import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z
    .string({
      required_error: "Your name is required",
    })
    .min(5, { message: "Your name must be 5 or more characters long" }),
  email: z
    .string({
      required_error: "Your email is required",
    })
    .email({ message: "Invalid email address" }),
  organization: z
    .string({
      required_error: "Your organization is required",
    })
    .min(10, {
      message: "Your organization must be 10 or more characters long",
    }),
  inquiry: z
    .string({
      required_error: "Your inquiry is required",
    })
    .min(10, { message: "Your inquiry must be 10 or more characters long" }),
});
type FormData = z.infer<typeof schema>;

const ContactPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [isLoading, setLoading] = useState(false);
  const onSubmit = (data: FieldValues) => {
    setLoading(true);
    console.log("Submitting the form", data);
    setLoading(false);
  };

  return (
    <Card align="center" my={20} p={8} shadow="xl" borderRadius="2xl">
      <CardHeader>
        <Heading
          size="4xl"
          textAlign="center"
          mb={8}
          bgGradient="linear(to-r, blue.300, green.600, yellow.500)"
          bgClip="text"
        >
          Have question? Get in touch now
        </Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Your name</FormLabel>
              <Input {...register("name")} id="name" type="text" />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Your email</FormLabel>
              <Input {...register("email")} id="email" type="text" />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.organization}>
              <FormLabel htmlFor="organization">Your organization</FormLabel>
              <Input
                {...register("organization")}
                id="organization"
                type="text"
              />
              <FormErrorMessage>
                {errors.organization?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.inquiry}>
              <FormLabel htmlFor="inquiry">Your inquiry</FormLabel>
              <Input {...register("inquiry")} id="inquiry" type="text" />
              <FormErrorMessage>{errors.inquiry?.message}</FormErrorMessage>
            </FormControl>
            <Button
              colorScheme="blue"
              variant="solid"
              type="submit"
              mt={3}
              isLoading={isLoading}
            >
              SEND
            </Button>
          </VStack>
        </form>
      </CardBody>
      <CardFooter>
        <Heading size="xs" textAlign="center">
          We typically response within 24 hours from your sending time
        </Heading>
      </CardFooter>
    </Card>
  );
};

export default ContactPage;
