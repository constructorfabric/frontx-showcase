import { FoundationStage } from './FoundationStage';

/** A foundation stage around a short token table. */
export default function FoundationStageShowcase() {
  return (
    <FoundationStage>
      <table>
        <caption>Spacing tokens</caption>
        <tbody>
          <tr>
            <th scope="row">--space-4</th>
            <td>1rem</td>
          </tr>
        </tbody>
      </table>
    </FoundationStage>
  );
}
