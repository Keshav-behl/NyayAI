require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

const LEGAL_DATA = [
  { act: 'IPC', section: '302', title: 'Punishment for murder', text: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine. Murder is defined under Section 300 of the Indian Penal Code as culpable homicide amounting to murder when the act is done with intention to cause death, or with intention to cause bodily injury as the offender knows to be likely to cause the death of the person.' },
  { act: 'IPC', section: '420', title: 'Cheating and dishonestly inducing delivery of property', text: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.' },
  { act: 'IPC', section: '376', title: 'Punishment for rape', text: 'Whoever commits rape shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine. In cases of rape of a woman under twelve years of age, the punishment shall be rigorous imprisonment for a term not less than twenty years.' },
  { act: 'IPC', section: '498A', title: 'Husband or relative of husband of a woman subjecting her to cruelty', text: 'Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine. Cruelty means any wilful conduct which is of such a nature as is likely to drive the woman to commit suicide or to cause grave injury or danger to life, limb or health.' },
  { act: 'IPC', section: '307', title: 'Attempt to murder', text: 'Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.' },
  { act: 'IPC', section: '354', title: 'Assault or criminal force to woman with intent to outrage her modesty', text: 'Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.' },
  { act: 'IPC', section: '406', title: 'Punishment for criminal breach of trust', text: 'Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both. Criminal breach of trust involves dishonest misappropriation or conversion of property entrusted to a person.' },
  { act: 'IPC', section: '120B', title: 'Punishment of criminal conspiracy', text: 'Whoever is a party to a criminal conspiracy to commit an offence punishable with death, imprisonment for life or rigorous imprisonment for a term of two years or upwards, shall be punished in the same manner as if he had abetted such offence.' },
  { act: 'CrPC', section: '41', title: 'When police may arrest without warrant', text: 'Any police officer may without an order from a Magistrate and without a warrant, arrest any person who has been concerned in any cognizable offence, or against whom a reasonable complaint has been made, or credible information has been received, or a reasonable suspicion exists. The police officer must have reasons to believe based on information and material that the person has committed a cognizable offence punishable with imprisonment up to 7 years.' },
  { act: 'CrPC', section: '154', title: 'Information in cognizable cases - FIR', text: 'Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant. Every such information shall be signed by the person giving it, and the substance thereof shall be entered in a book to be kept by such officer. This is known as the First Information Report (FIR).' },
  { act: 'CrPC', section: '161', title: 'Examination of witnesses by police', text: 'Any police officer making an investigation under this Chapter may examine orally any person supposed to be acquainted with the facts and circumstances of the case. The person being examined is bound to answer truly all questions relating to such case put to him by such officer.' },
  { act: 'CrPC', section: '167', title: 'Procedure when investigation cannot be completed in twenty-four hours', text: 'Whenever any person is arrested and detained in custody and it appears that the investigation cannot be completed within twenty-four hours, and there are grounds for believing that the accusation is well-founded, the officer shall transmit to the nearest Judicial Magistrate a copy of the entries in the diary.' },
  { act: 'CrPC', section: '438', title: 'Direction for grant of bail to person apprehending arrest - Anticipatory Bail', text: 'When any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction that in the event of such arrest he shall be released on bail. The Court may direct that in the event of such arrest, he shall be released on bail.' },
  { act: 'CrPC', section: '482', title: 'Saving of inherent powers of High Court', text: 'Nothing in this Code shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Code, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.' },
  { act: 'Contract Act', section: '10', title: 'What agreements are contracts', text: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void. A valid contract requires: offer, acceptance, consideration, capacity, free consent, and lawful object.' },
  { act: 'Contract Act', section: '14', title: 'Free consent defined', text: 'Consent is said to be free when it is not caused by coercion, undue influence, fraud, misrepresentation, or mistake. Where consent to an agreement is caused by coercion, undue influence, fraud, or misrepresentation, the agreement is a contract voidable at the option of the party whose consent was so caused.' },
  { act: 'Contract Act', section: '73', title: 'Compensation for loss or damage caused by breach of contract', text: 'When a contract has been broken, the party who suffers by such breach is entitled to receive compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew when they made the contract to be likely to result from the breach.' },
  { act: 'Contract Act', section: '74', title: 'Compensation for breach of contract where penalty stipulated for', text: 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, the party complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named or the penalty stipulated for, whether or not actual damage or loss is proved.' },
  { act: 'Contract Act', section: '19', title: 'Voidability of agreements without free consent', text: 'When consent to an agreement is caused by coercion, fraud, or misrepresentation, the agreement is a contract voidable at the option of the party whose consent was so caused. A party may insist that the contract shall be performed and that he shall be put in the position in which he would have been if the representations made had been true.' },
  { act: 'Consumer Protection Act', section: '2(7)', title: 'Definition of Consumer', text: 'Consumer means any person who buys any goods for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment. A consumer also includes any person who hires or avails of any services for a consideration which has been paid or promised.' },
  { act: 'Consumer Protection Act', section: '35', title: 'Manner in which complaint shall be made', text: 'A complaint in relation to any goods sold or delivered or any service provided may be filed with a District Commission by the consumer to whom such goods are sold or delivered or such service provided or agreed to be provided.' },
  { act: 'RTI Act', section: '3', title: 'Right to information', text: 'Subject to the provisions of this Act, all citizens shall have the right to information. Every citizen has the right to request information from a public authority, which is obligated to reply within 30 days. The information can include inspection of work, documents and records, taking notes, extracts or certified copies of documents or records.' },
  { act: 'RTI Act', section: '7', title: 'Disposal of request', text: 'The Central Public Information Officer or State Public Information Officer, on receipt of a request shall, as expeditiously as possible, and in any case within thirty days of the receipt of the request, either provide the information on payment of such fee as may be prescribed or reject the request for any of the reasons specified in sections 8 and 9.' },
];

async function ingestData() {
  console.log('🚀 Starting legal data ingestion into Pinecone...');
  console.log(`📚 Total sections to ingest: ${LEGAL_DATA.length}`);

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index(
    process.env.PINECONE_INDEX_NAME || 'nyayai-legal',
    process.env.PINECONE_HOST
  );

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < LEGAL_DATA.length; i++) {
    const item = LEGAL_DATA[i];
    const id = `${item.act.replace(/\s+/g, '_')}_${item.section.replace(/[()]/g, '')}`;

    try {
      console.log(`\n[${i + 1}/${LEGAL_DATA.length}] Ingesting ${item.act} Section ${item.section}...`);

      // With integrated embeddings, just upsert the record with text field
      // Pinecone auto-embeds using llama-text-embed-v2
      await index.upsertRecords({
         namespace: '__default__',
        records: [{
        id,
        text: `${item.act} Section ${item.section}: ${item.title}. ${item.text}`,
        act: item.act,
        section: item.section,
        title: item.title,
        originalText: item.text,
            }]
        });

      console.log(`  ✅ ${item.act} Section ${item.section} ingested`);
      successCount++;

      await new Promise(r => setTimeout(r, 300));

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`✅ Ingestion complete!`);
  console.log(`   Success: ${successCount}/${LEGAL_DATA.length}`);
  console.log(`   Errors:  ${errorCount}/${LEGAL_DATA.length}`);
  console.log('========================================');
}

ingestData().catch(console.error);