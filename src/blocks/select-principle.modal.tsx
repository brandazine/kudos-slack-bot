/** @jsxImportSource jsx-slack */
import { Actions, Checkbox, CheckboxGroup, Input, Modal } from 'jsx-slack';
import { BuiltInComponent } from 'jsx-slack/types/jsx-internals';
import { MarkOptional } from 'ts-essentials';

import { BrandazinePrinciple } from '../enums';

export interface SelectPrincipleModalProps {
  praiseId: string;
  channelId: string;
}

declare module 'jsx-slack' {}

export const SelectPrincipleModal = (props: SelectPrincipleModalProps) => {
  const privateMetadata = JSON.stringify(props);

  return (
    <Modal title="Select Principles" callbackId="submit-praise-principles" privateMetadata={privateMetadata}>
      <Actions>
        <CheckboxGroup id="principles" label={undefined as unknown as string} name="principles" required>
          <Checkbox value={BrandazinePrinciple.MaximizeYourPotential}>
            <b>Maximize your potential</b>: Strive for the greatest result
            <small>
              우리는 끊임없이 고민하고 노력해야합니다. 남들이 마무리를 지을 시점에 우리는 한 발자국 더 내딛습니다.
              우리의 서비스와 제품에 최고를 지향하는 영혼을 담으며, 최고의 서비스와 제품을 통해 단기적, 장기적으로
              고객들에게 영감을 줍니다.
            </small>
          </Checkbox>
          <Checkbox value={BrandazinePrinciple.HackYourSuccess}>
            <b>Hack your success</b>: Break rules
            <small>
              우리는 게임을 우아하게 플레이 하는 것을 지양합니다. 우리는 기존 관습과 습관들에 저항하며 해킹하는 방법들을
              계속해서 찾아나섭니다. 문제를 맞닥트렸을 때, 우리는 한발자국 물러나, 다시 한 번 고민하고 전형적이지 않은
              방식으로 해결합니다.
            </small>
          </Checkbox>
          <Checkbox value={BrandazinePrinciple.BeACurator}>
            <b>Be a curator</b>:Inspire each other
            <small>
              우리는 우리의 창의력과 뚜렷한 비전, 인정과 존중을 통해 서로에게 영감을 줍니다. 이러한 강력한 영감을 통해
              큐레이터, 브랜드 그리고 팀원들의 성장을 돕습니다.
            </small>
          </Checkbox>
          <Checkbox value={BrandazinePrinciple.ChampionTheCommunity}>
            <b>Champion the community</b>: Earn trust
            <small>
              우리는 올스타팀 처럼 명확한 목표를 중심으로 이해관계를 강력하게 동기화합니다. 여러가지 개념들을 단순화하며
              명확한 소통으로 결과를 도출해냅니다.
            </small>
          </Checkbox>
          <Checkbox value={BrandazinePrinciple.BeYourTrueSelf}>
            <b>Be your true self</b>: Be authentic
            <small>
              우리는 진정성있게 일 합니다. 다양한 주장들이 발생할 수 있는 진정성 있는 환경을 추구 합니다. 우리는
              브랜더진의 지속가능한 장기적 목표를 달성하기 위해서 설령 불편한 이야기라도 솔직하게 말 합니다.
            </small>
          </Checkbox>
        </CheckboxGroup>
      </Actions>
      <Input type="submit" value="Submit" />
    </Modal>
  );
};
