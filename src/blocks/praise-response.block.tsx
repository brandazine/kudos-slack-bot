/** @jsxImportSource jsx-slack */
import { Actions, Blocks, Button, Section } from 'jsx-slack';

export interface PraiseResponseBlockProps {
  praiseId: string;
}

export const PraiseResponseBlock = (props: PraiseResponseBlockProps) => {
  return (
    <Blocks>
      <Section>
        <p>
          <b>[Kudos]</b> Added!
        </p>
      </Section>
      <Actions>
        <Button actionId="open-select-praise-principles" value={props.praiseId}>
          :sparkles: Select Principles
        </Button>
      </Actions>
    </Blocks>
  );
};
