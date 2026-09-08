/**
 * All disease/finding explanations for the Mediora AI screening models.
 *
 * Chest X-ray model (TorchXRayVision ResNet-50): 18 labels
 * Skin lesion model (ResNet-50): 2 labels (Benign, Malignant)
 *
 * Labels are normalized: underscores -> spaces (e.g. "Pleural_Thickening" -> "pleural thickening")
 * Use the provided `normalizeLabel()` helper when looking up any model label.
 */

export type FindingDetail = {
  title: string;
  /** 3-4 detailed paragraphs shown in the About section */
  paragraphs: string[];
  whatHappens: string | null;
  causes: string[];
  xrayAppearance: string | null;
  /** Short one-line description for the findings list */
  shortDescription: string;
  /** Clinical urgency level */
  urgency: "low" | "moderate" | "high";
  /** Whether clinical review is recommended */
  reviewRecommended: boolean;
};

const DISEASE_DETAIL: Record<string, FindingDetail> = {

  // ─── Chest X-ray Labels ───────────────────────────────────────────────

  atelectasis: {
    title: "About atelectasis",
    shortDescription: "Partial lung collapse from airway blockage or external pressure",
    paragraphs: [
      "Atelectasis means a portion of the lung has collapsed and cannot expand fully. The air sacs (alveoli) in the affected area deflate, reducing the lung's surface area for oxygen and carbon dioxide exchange. This can involve a small sub-segment or an entire lobe of the lung. The collapse may happen gradually or suddenly depending on the cause.",
      "The most common mechanism is airway blockage -- when a bronchus becomes obstructed by mucus, a tumor, a foreign object, or swollen tissue. Without airflow, the trapped air is absorbed into the bloodstream and the alveoli collapse. External pressure from pleural effusion, pneumothorax, or a tumor can also compress lung tissue and prevent expansion.",
      "Symptoms vary with the extent of collapse. Small atelectasis often produces no symptoms and is found incidentally on imaging. Larger areas cause cough, chest pain, shortness of breath, and rapid breathing. In children, mucus plugging is the leading cause and may present with sudden respiratory distress.",
      "Treatment targets the underlying cause: airway clearance techniques, bronchoscopy to remove blockages, treating the infection or inflammation driving the collapse, and drainage of pleural fluid if present. Simple deep-breathing exercises and incentive spirometry help prevent atelectasis after surgery.",
    ],
    whatHappens: "When an airway becomes blocked or external pressure compresses the lung, the trapped air in the alveoli is absorbed into the bloodstream, causing those air sacs to collapse. This reduces the lung's surface area for gas exchange, leading to lower oxygen levels in the blood.",
    causes: [
      "Mucus plugging (common after surgery, in cystic fibrosis, or severe asthma)",
      "Airway obstruction by tumor or foreign body",
      "Pleural effusion pressing on and compressing the lung tissue",
      "Pneumothorax with mediastinal shift compressing the opposite lung",
      "Chest trauma with reduced breathing effort due to pain",
      "Abdominal surgery with elevated diaphragm reducing lung expansion",
    ],
    xrayAppearance: "Appears as areas of increased density (whiteness) with loss of lung volume. The collapsed lobe or segment shrinks, pulling surrounding structures -- bronchi, fissures, hilum -- toward the area. Air bronchograms may be visible if the bronchi remain patent. The diaphragm on the affected side may be elevated.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  consolidation: {
    title: "About pulmonary consolidation",
    shortDescription: "Lung tissue filled with fluid, pus, or cells -- infection is the most common cause",
    paragraphs: [
      "Consolidation refers to a region of the lung that has become solid and dense because the air spaces normally filled with air are instead filled with fluid, pus, blood, or inflammatory cells. The air spaces that should appear black on an X-ray appear white instead. This is one of the most common X-ray findings and is a sign of acute lung inflammation or infection.",
      "The hallmark radiographic sign of consolidation is the air bronchogram -- dark (air-filled) bronchi visible through the white consolidated lung tissue. This happens because the bronchi themselves are not blocked; only the surrounding alveoli are filled. Air bronchograms indicate patent airways surrounded by non-aerated lung, and are classically seen in bacterial pneumonia.",
      "Lobar consolidation -- involving an entire lobe -- is the classic presentation of bacterial community-acquired pneumonia. The consolidation is often homogeneous (uniformly white) with a sharp border at the fissure. Bronchopneumonia produces more patchy, multifocal consolidation. Atypical pneumonias (viral, mycoplasma) typically produce less dense, more diffuse interstitial patterns rather than consolidation.",
      "Clinical correlation is essential because consolidation is a description of an X-ray appearance, not a diagnosis. Treatment depends entirely on the cause: bacterial pneumonia requires antibiotics, viral pneumonitis requires supportive care, pulmonary hemorrhage requires addressing the bleeding source, and edema requires diuretics and treating heart failure.",
    ],
    whatHappens: "Inflammatory exudate -- fluid, immune cells, fibrin, and debris -- fills the alveoli, displacing air. The affected lung tissue becomes solid and opaque on X-ray. Because the bronchi remain air-filled, they become visible as dark branching structures against the white background -- the classic air bronchogram.",
    causes: [
      "Bacterial pneumonia (most common cause of lobar consolidation)",
      "Viral pneumonitis (less dense, more patchy)",
      "Pulmonary hemorrhage (bleeding into the lungs)",
      "Acute respiratory distress syndrome (ARDS)",
      "Severe pulmonary edema in heart failure",
      "Aspiration pneumonia from inhaled gastric contents",
    ],
    xrayAppearance: "Appears as a homogeneous white (radiopaque) area that may silhouette the heart border or diaphragm if adjacent. The border with aerated lung is often indistinct (ill-defined). Air bronchograms are typically visible as dark branching lines through the white consolidation. The affected area does not change significantly with patient positioning.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  infiltration: {
    title: "About pulmonary infiltration",
    shortDescription: "Abnormal density in lung tissue -- infection, inflammation, or fluid",
    paragraphs: [
      "A pulmonary infiltrate is an area of increased density on a chest X-ray that suggests material has accumulated in the lung tissue -- fluid, pus, blood, inflammatory cells, or tumor cells. It is not a diagnosis itself but a radiologic description of something that is affecting the lung. The term is intentionally broad because many different conditions produce similar appearances.",
      "The pattern of infiltration helps narrow the differential. Reticular infiltrates (fine net-like lines) suggest interstitial disease -- affecting the tissue between the air sacs. Reticulonodular infiltrates add small nodules to the reticular pattern. Alveolar (acinar) infiltrates produce fuzzy, cloud-like opacities that can coalesce into consolidation. The distribution -- upper vs lower lobe, central vs peripheral -- also guides interpretation.",
      "In clinical practice, 'infiltrate' most often leads to consideration of pneumonia. However, the same appearance can be produced by pulmonary edema from heart failure, pulmonary hemorrhage, acute respiratory distress syndrome (ARDS), interstitial lung disease, or even tumor. Clinical context -- symptoms, vital signs, medical history -- is critical for distinguishing between these causes.",
      "Further evaluation typically includes blood tests (complete blood count, inflammatory markers), sputum culture if productive cough is present, and often a CT scan for better characterization. If the infiltrate does not resolve with antibiotic treatment for pneumonia, non-infectious causes must be investigated.",
    ],
    whatHappens: "Material accumulates in the lung's air spaces or interstitium (the supportive tissue between air sacs). This material -- inflammatory fluid, pus, blood, or cells -- is denser than air and appears as a whitish opacity on X-ray. The accumulation can block gas exchange in the affected area, reducing oxygen uptake.",
    causes: [
      "Pneumonia (bacterial, viral, or fungal infection of the lung)",
      "Pulmonary edema from left-sided heart failure",
      "Pulmonary hemorrhage (bleeding into the lung tissue)",
      "Acute interstitial pneumonia or ARDS (diffuse alveolar damage)",
      "Inflammatory or autoimmune lung diseases (e.g., vasculitis, hypersensitivity pneumonitis)",
      "Tumor infiltration of lung tissue (primary lung cancer or metastatic disease)",
    ],
    xrayAppearance: "Appears as hazy or fluffy white areas that may blur the outlines of blood vessels and airways. The borders are usually ill-defined, blending into surrounding aerated lung. Multiple small acinar shadows can coalesce into larger areas of consolidation. The distribution and pattern (reticular, nodular, or alveolar) provides clues to the underlying cause.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  pneumothorax: {
    title: "About pneumothorax",
    shortDescription: "Collapsed lung from air in the pleural space -- sudden chest pain and breathlessness",
    paragraphs: [
      "Pneumothorax occurs when air leaks into the pleural space -- the normally air-tight cavity between the lung and the chest wall. This air creates positive pressure that pushes the lung away from the chest wall, causing partial or complete lung collapse. The lung on the affected side can no longer expand normally, reducing the overall breathing capacity. The condition can develop suddenly (acute) or gradually.",
      "Spontaneous pneumothorax occurs without trauma or known cause, most commonly in tall thin young men (primary spontaneous pneumothorax) due to rupture of blebs -- small blisters on the lung surface. Secondary spontaneous pneumothorax occurs in people with underlying lung disease such as COPD, cystic fibrosis, or asthma. Traumatic pneumothorax results from chest injury that punctures the lung or chest wall.",
      "The classic presentation is sudden sharp chest pain on one side with sudden shortness of breath. The pain is often pleuritic -- worse with a deep breath. In tension pneumothorax -- a medical emergency -- the air leak acts as a one-way valve, accumulating with each breath and progressively compressing both lungs and the heart. This causes severe respiratory distress, low blood pressure, distended neck veins, and shifting of the trachea away from the affected side.",
      "A small primary spontaneous pneumothorax may resolve on its own with supplemental oxygen and observation. Larger pneumothoraces or those causing symptoms typically require needle aspiration or chest tube insertion to remove the trapped air. Recurrent pneumothoraces may be treated with pleurodesis (making the lung adhere to the chest wall) or surgical resection of blebs.",
    ],
    whatHappens: "Air enters the pleural space through a hole in the lung surface or chest wall. Because the pleural space is normally a sealed potential space, the incoming air creates positive pressure that collapses the lung away from the chest wall. This reduces the lung's volume and its ability to participate in breathing.",
    causes: [
      "Spontaneous rupture of lung surface blebs (tall thin young men most at risk)",
      "Chest trauma (car accident, fall, stabbing, rib fracture)",
      "COPD and emphysema (destroyed lung tissue ruptures more easily)",
      "Mechanical ventilation with high pressures",
      "Medical procedures (central line insertion, bronchoscopy, lung biopsy)",
      "Pulmonary infections that weaken lung tissue (pneumonia, tuberculosis, Pneumocystis)",
    ],
    xrayAppearance: "Appears as absence of lung markings (dark, empty area) in the periphery of the chest with a visible visceral pleural line -- a thin white line representing the edge of the collapsed lung. The lung collapses inward toward the hilum. In supine patients, pneumothorax may collect anteriorly and appear as an abnormally sharp diaphragmatic contour. A tension pneumothorax shows mediastinal shift away from the affected side and flattened diaphragm.",
    urgency: "high",
    reviewRecommended: true,
  },

  edema: {
    title: "About pulmonary edema",
    shortDescription: "Fluid in the lungs -- usually from heart failure or fluid overload",
    paragraphs: [
      "Pulmonary edema means there is excess fluid in the lungs' air sacs and interstitial tissue. The most common cause is failure of the left side of the heart (left ventricular failure), which causes blood to back up in the pulmonary circulation, increasing pressure in the pulmonary capillaries until fluid leaks out into the lung tissue. This is called cardiogenic or hydrostatic pulmonary edema. It is a hallmark of decompensated heart failure.",
      "In cardiogenic pulmonary edema, the elevated pressure in the pulmonary veins forces fluid across the capillary walls into the interstitial space and eventually into the alveoli. This fluid impairs gas exchange -- oxygen has difficulty crossing the fluid-filled membrane into the bloodstream, and carbon dioxide struggles to leave. The result is low blood oxygen (hypoxemia) and respiratory distress.",
      "Non-cardiogenic pulmonary edema has many causes. High altitude pulmonary edema (HAPE) occurs at elevations above 2,500 meters due to hypoxia causing pulmonary vasoconstriction and elevated pressures. Neurogenic pulmonary edema follows brain injury or seizures. Other causes include kidney failure with fluid overload, severe sepsis (ARDS), transfusion-related acute lung injury (TRALI), and drug overdose (especially opioids).",
      "Treatment focuses on the underlying cause and improving oxygenation. Cardiogenic edema is treated with diuretics (to reduce fluid volume), vasodilators (to reduce heart workload), and oxygen. Non-invasive positive pressure ventilation (CPAP or BiPAP) helps recruit alveoli and reduce the work of breathing. In severe cases, intubation and mechanical ventilation are required.",
    ],
    whatHappens: "Increased pressure in the pulmonary capillaries -- either from heart failure (cardiogenic) or from direct lung injury (non-cardiogenic) -- forces fluid out of the blood vessels and into the lung tissue and air sacs. This fluid flooding the alveoli displaces air and severely impairs the lungs' ability to oxygenate blood and remove carbon dioxide.",
    causes: [
      "Left-sided heart failure and congestive heart failure (most common)",
      "Acute myocardial infarction (heart attack) reducing heart pump function",
      "High altitude pulmonary edema (HAPE) -- hypoxia at elevation",
      "Acute respiratory distress syndrome (ARDS) from sepsis, trauma, or aspiration",
      "Kidney failure with fluid overload and inability to excrete water",
      "Opioid overdose causing neurogenic pulmonary edema",
    ],
    xrayAppearance: "Classically appears as bilateral (both lungs) hazy or fluffy opacities -- often described as a 'bat wing' or 'butterfly' pattern -- concentrated around the hila and sparing the lung periphery. Kerley B lines (horizontal lines at the lung bases at the pleural surfaces) indicate interstitial fluid. Small pleural effusions are commonly present. The heart shadow is often enlarged (cardiomegaly) in cardiogenic causes.",
    urgency: "high",
    reviewRecommended: true,
  },

  emphysema: {
    title: "About emphysema",
    shortDescription: "Destroyed air sacs in the lungs -- almost always from smoking",
    paragraphs: [
      "Emphysema is a type of COPD (chronic obstructive pulmonary disease) characterized by permanent destruction and enlargement of the alveoli (air sacs). The delicate walls between air sacs are destroyed, creating larger but fewer, less efficient air spaces. These enlarged sacs have reduced surface area for gas exchange, and their weak walls collapse during exhalation, trapping stale air inside. The lungs become chronically overinflated.",
      "Smoking is by far the leading cause -- the chemicals in tobacco smoke activate inflammatory cells (neutrophils and macrophages) that release enzymes that digest the elastic structural proteins in the alveolar walls. The enzyme antiprotease balance is disrupted. In non-smokers, alpha-1 antitrypsin deficiency -- a genetic condition where the lung protective enzyme is absent -- causes early-onset emphysema, typically in the lower lobes.",
      "Symptoms develop gradually over years. Progressive shortness of breath is the hallmark -- first with exertion, then at rest in advanced disease. Chronic cough and sputum production are common. Patients often lose weight and develop barrel chest (overinflated lungs pushing the ribs outward). As the disease advances, oxygen levels drop and carbon dioxide accumulates.",
      "Emphysema is diagnosed with spirometry (lung function testing) showing airflow obstruction that does not fully reverse with bronchodilator. Chest X-ray shows hyperinflated lungs with flattened diaphragms, increased retrosternal airspace, and decreased peripheral vascular markings. CT scan is more sensitive. Treatment includes smoking cessation (the only intervention that slows progression), bronchodilators, inhaled steroids, pulmonary rehabilitation, and oxygen therapy in advanced disease.",
    ],
    whatHappens: "Chronic inflammation from cigarette smoke (or alpha-1 antitrypsin deficiency) activates destructive enzymes that break down the elastic walls of the alveoli. Air sacs merge into larger, dysfunctional bullae (air spaces). The destroyed alveolar walls reduce the surface area for gas exchange, and the loss of elastic recoil causes airways to collapse during exhalation, trapping air inside the lungs.",
    causes: [
      "Cigarette smoking (approximately 85-90% of all cases)",
      "Alpha-1 antitrypsin deficiency (genetic, causes lower-lobe emphysema in non-smokers)",
      "Occupational exposures (coal dust, silica, cadmium fumes)",
      "Chronic exposure to biomass fuel smoke (common in developing countries)",
      "Age-related changes in lung elasticity (senile emphysema -- mild, without symptoms)",
      "Recurrent childhood respiratory infections contributing to lung damage over time",
    ],
    xrayAppearance: "Shows hyperinflated lungs with a flattened or even inverted diaphragm (best seen on lateral film). Increased anteroposterior chest diameter. Decreased peripheral vascular markings. Increased retrosternal translucency on the lateral view. Large bullae (thin-walled air spaces) may be visible. The heart shadow may appear long and narrow ('teardrop' heart) due to hyperinflation.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  fibrosis: {
    title: "About pulmonary fibrosis",
    shortDescription: "Lung scarring that makes lungs stiff and hard to expand",
    paragraphs: [
      "Pulmonary fibrosis involves progressive scarring (fibrosis) of the lung tissue, making the lungs stiff and reducing their ability to expand and transfer oxygen. The alveoli and the surrounding interstitial tissue become thickened with collagen and fibrous tissue. This reduces lung compliance -- the lungs become stiff and resistant to expansion -- making each breath an effort. Gas exchange is progressively impaired as the alveolar-capillary membrane thickens.",
      "The scarring can result from known causes or occur without identifiable trigger (idiopathic). Known causes include occupational exposures (asbestos, silica, coal dust, hard metal), autoimmune diseases (rheumatoid arthritis, scleroderma, polymyositis), certain medications (chemotherapy drugs, nitrofurantoin, methotrexate), and chronic hypersensitivity pneumonitis from inhaled allergens.",
      "Idiopathic pulmonary fibrosis (IPF) is the most common idiopathic interstitial pneumonia. It typically affects people over 60 and has a poor prognosis, with median survival of 3-5 years from diagnosis. IPF follows a variable course -- some patients decline rapidly, others experience periods of relative stability interrupted by acute exacerbations.",
      "The hallmark symptom is progressive dyspnea (shortness of breath) on exertion over months to years, accompanied by a dry cough. On examination, crackles (Velcro-like sounds) are heard at the lung bases. Clubbing of the fingers is common. Diagnosis requires high-resolution CT (HRCT) showing a usual interstitial pneumonia (UIP) pattern with honeycombing. Treatment includes antifibrotic drugs (nintedanib, pirfenidone) that slow progression, pulmonary rehabilitation, and supplemental oxygen.",
    ],
    whatHappens: "Repeated injury to lung tissue triggers a dysregulated repair response. Fibroblasts (connective tissue cells) are activated and deposit excessive collagen and extracellular matrix in the lung interstitium -- the supportive tissue between air sacs and blood vessels. This thickens and stiffens the alveolar-capillary membrane, impairing oxygen diffusion and making the lungs resistant to expansion.",
    causes: [
      "Idiopathic pulmonary fibrosis (IPF) -- most common, no known cause",
      "Occupational exposures: asbestosis, silicosis, coal worker pneumoconiosis",
      "Autoimmune diseases: rheumatoid arthritis, scleroderma, dermatomyositis/polymyositis",
      "Chronic hypersensitivity pneumonitis from inhaled organic antigens (bird droppings, mold)",
      "Drug-induced: chemotherapy agents, nitrofurantoin, amiodarone, methotrexate",
      "Radiation therapy to the chest for breast cancer, lymphoma, or lung cancer",
    ],
    xrayAppearance: "Shows reduced lung volumes with bilateral reticular (net-like) opacities predominantly in the lower lobes. Traction bronchiectasis -- airways held open by surrounding fibrosis -- is a key finding. Advanced disease shows honeycombing: small cystic spaces with well-defined walls representing end-stage fibrotic lung. CT is far more sensitive and specific than chest X-ray for fibrosis.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  effusion: {
    title: "About pleural effusion",
    shortDescription: "Fluid trapped between the lung and chest wall -- many underlying causes",
    paragraphs: [
      "A pleural effusion is an abnormal collection of fluid in the pleural space -- the normally thin, virtually invisible gap between the lung's visceral pleura and the chest wall's parietal pleura. The pleural space normally contains only a few milliliters of lubricating fluid. An effusion means that excess fluid has accumulated -- as little as 200-300 mL can be detected on an upright chest X-ray, while smaller effusions require lateral decubitus films or ultrasound.",
      "Pleural fluid is classified as transudate or exudate based on its protein and lactate dehydrogenase (LDH) content (Light's criteria). Transudates are caused by systemic factors disrupting Starling forces -- most commonly heart failure and cirrhosis. They are clear, straw-colored, and low in protein. Exudates are caused by local factors affecting the pleura itself -- infection, malignancy, inflammation, or pulmonary embolism. They are cloudier and high in protein.",
      "A large pleural effusion can compress the underlying lung, causing shortness of breath even before the lung itself is diseased. The fluid collection appears white (opaque) on X-ray. Massive effusions can cause near-complete opacification of a hemithorax and mediastinal shift away from the fluid. In these cases, thoracentesis -- needle drainage -- provides both symptom relief and fluid for analysis.",
      "Treatment addresses both the effusion itself and the underlying cause. Symptomatic large effusions are drained by thoracentesis or chest tube. Malignant effusions often require indwelling pleural catheters or pleurodesis (making the pleural surfaces adhere to prevent fluid re-accumulation). Recurrent effusions from heart failure are managed medically with diuretics.",
    ],
    whatHappens: "Fluid accumulates in the pleural space when production of pleural fluid exceeds reabsorption. Normally, fluid is driven into the pleural space by capillary hydrostatic pressure and removed by lymphatic drainage. When pulmonary capillary pressure rises (heart failure), plasma oncotic pressure falls (low albumin), or pleural permeability increases (infection, cancer), fluid accumulates faster than it can be drained.",
    causes: [
      "Heart failure (most common cause of transudative effusion)",
      "Hepatic cirrhosis with portal hypertension (hepatic hydrothorax)",
      "Pneumonia with parapneumonic effusion (exudate, may become complicated)",
      "Malignant pleural effusion from lung, breast, or lymphoma metastases",
      "Pulmonary embolism (often small, sometimes hemorrhagic)",
      "Tuberculous pleuritis (common cause in endemic areas)",
    ],
    xrayAppearance: "On upright films: blunts the lateral costophrenic angle (obliteration is visible when fluid exceeds 200-300 mL). A massive effusion opacifies most of the hemithorax and may cause mediastinal shift away from the fluid. On lateral decubitus films: fluid layers against the dependent chest wall. Ultrasound is the most sensitive method for small effusions and can guide thoracentesis.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  pneumonia: {
    title: "About pneumonia",
    shortDescription: "Lung infection causing air sacs to fill with fluid or pus",
    paragraphs: [
      "Pneumonia is an infection that inflames the air sacs (alveoli) in one or both lungs. The alveoli may fill with fluid or pus, causing cough (often productive), fever, chills, and difficulty breathing. The infection can be caused by bacteria, viruses, fungi, or mycoplasma organisms. It ranges from a mild community-acquired illness to a life-threatening condition requiring hospitalization and intensive care support.",
      "Bacterial pneumonia typically produces lobar consolidation -- a dense, homogeneous white opacity involving an entire lobe. Streptococcus pneumoniae (pneumococcus) is the most common bacterial cause. The patient often has high fever, rigors (shaking chills), productive cough with rust-colored or purulent sputum, and pleuritic chest pain. Viral pneumonias tend to produce more diffuse, bilateral, less dense infiltrates and are often preceded by upper respiratory symptoms.",
      "Risk factors for severe pneumonia include advanced age, chronic lung disease (COPD, bronchiectasis), immunosuppression (HIV, chemotherapy, steroids), chronic diseases (diabetes, heart failure, liver disease), and recent viral respiratory infection (influenza). Severe pneumonia can lead to respiratory failure requiring mechanical ventilation, sepsis, and multi-organ failure.",
      "Diagnosis is confirmed by chest X-ray showing new consolidation or infiltrate. Treatment for bacterial pneumonia is antibiotic therapy -- ideally started within 4 hours of presentation for hospitalized patients. Most community-acquired pneumonia can be treated at home with oral antibiotics for 5-7 days. Vaccinations against pneumococcus and influenza significantly reduce the risk of community-acquired pneumonia.",
    ],
    whatHappens: "Infectious organisms reach the alveoli through inhalation, aspiration of oropharyngeal contents, or the bloodstream. The immune system responds with inflammation, sending white blood cells (primarily neutrophils) and fluid into the infected alveoli. This exudate fills the air spaces, reducing the surface area for gas exchange. The infected lobe becomes dense and opaque on X-ray.",
    causes: [
      "Streptococcus pneumoniae (pneumococcus) -- most common bacterial cause",
      "Haemophilus influenzae -- second most common bacterial cause",
      "Mycoplasma pneumoniae -- common in young adults, 'atypical' presentation",
      "Legionella pneumophila -- severe pneumonia with prominent systemic symptoms",
      "Influenza virus -- can be primary viral or predispose to secondary bacterial pneumonia",
      "Aspiration of gastric contents -- chemical injury plus bacterial infection",
    ],
    xrayAppearance: "Bacterial lobar pneumonia: dense homogeneous consolidation of a lobe or segment with air bronchograms visible within the white area. The affected lobe may show volume loss with elevated diaphragm. Atypical/viral pneumonia: bilateral interstitial or patchy infiltrates, often more diffuse and less dense than bacterial consolidation. Round pneumonia (especially in children): a spherical mass-like consolidation.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  "pleural thickening": {
    title: "About pleural thickening",
    shortDescription: "Thickened lining around the lung -- usually from past inflammation",
    paragraphs: [
      "Pleural thickening refers to fibrous changes and scarring of the pleura -- the thin membrane that lines the inside of the chest wall and the outside of the lungs. This scarring develops in response to past inflammation, injury, or bleeding in the pleural space. The pleura becomes visibly thickened on chest X-ray or CT. The degree of thickening ranges from minimal (a few millimeters) to extensive that significantly restricts lung expansion.",
      "Diffuse pleural thickening is distinct from pleural plaques -- the latter are localized, smooth thickenings on the parietal pleura, classically caused by asbestos exposure. Diffuse thickening extends over a larger area and can encase the lung, restricting its movement. It typically follows complicated parapneumonic effusion, hemothorax, or empyema (pus in the pleural space) that was not adequately drained.",
      "Asbestos exposure is another major cause of diffuse pleural thickening. Inhaled asbestos fibers migrate to the pleura, causing inflammation and progressive fibrosis over decades. Asbestos-related pleural thickening is often asymptomatic but indicates significant exposure. It is a marker for potential asbestosis (interstitial fibrosis of the lung parenchyma) and increases risk of mesothelioma, a cancer of the pleura.",
      "Mild pleural thickening may cause no symptoms and requires no specific treatment. Extensive diffuse pleural thickening that restricts lung expansion and causes dyspnea may warrant pulmonary rehabilitation and, in severe cases, surgical decortication -- removal of the thickened fibrous 'peel' from the lung surface to allow re-expansion.",
    ],
    whatHappens: "Chronic inflammation or bleeding in the pleural space triggers fibroblasts to deposit collagen-rich scar tissue on the pleural surfaces. This fibrous 'peel' encases the lung and reduces compliance -- the lung cannot expand freely because the stiff pleural covering resists movement. Severe cases produce a 'trapped lung' that cannot re-expand even if the underlying disease resolves.",
    causes: [
      "Asbestos exposure (most common cause of diffuse pleural thickening)",
      "Complicated parapneumonic effusion or empyema (infection in pleural space)",
      "Hemothorax (blood in pleural space from trauma, surgery, or clotting disorder)",
      "Tuberculous pleuritis (TB infection of the pleura)",
      "Prior chest radiation therapy",
      "Chronic idiopathic pleural thickening (unknown cause)",
    ],
    xrayAppearance: "Appears as smooth, uniform thickening of the pleura along the chest wall. Complicated parapneumonic effusion or empyema shows a dense opacity with possibly an air-fluid level. CT shows the thickened pleura as a soft tissue density layer lining the chest wall. Rounded atelectasis (folded lung) may appear as a mass adjacent to areas of pleural thickening.",
    urgency: "low",
    reviewRecommended: true,
  },

  cardiomegaly: {
    title: "About cardiomegaly",
    shortDescription: "Enlarged heart on X-ray -- investigate the underlying cause",
    paragraphs: [
      "Cardiomegaly simply means the heart appears larger than normal on a chest X-ray. It is not a diagnosis but a radiologic sign that something is causing the heart to work harder than normal, leading to enlargement. The heart's width on an X-ray (the cardiothoracic ratio) typically exceeds 50% of the chest width in cardiomegaly. Both the atria and ventricles can contribute to apparent enlargement.",
      "The pattern of enlargement provides clinical clues. Left ventricular enlargement (LVH) -- evidenced by an elevated cardiac apex pushing the heart outline leftward and downward -- suggests hypertension, aortic stenosis, or cardiomyopathy. Right ventricular enlargement shifts the apex leftward and increases the retrosternal space on lateral films, and is seen in pulmonary hypertension, COPD, or pulmonary embolism.",
      "An enlarged heart is a sign, not a diagnosis. The underlying cause must be identified because treatment differs entirely. Hypertension requires blood pressure management. Aortic stenosis may need valve replacement. Cardiomyopathy requires heart failure medications. Arrhythmias may need cardioversion or ablation. Dilated cardiomyopathy may require specific heart failure therapy or consideration for mechanical circulatory support or transplant.",
      "Further investigation typically includes ECG (to check for LVH patterns and arrhythmias), echocardiogram (to measure chamber sizes, wall thickness, and ejection fraction), and possibly cardiac MRI or catheterization for complex cases. The chest X-ray also helps detect pulmonary edema or pleural effusion that may accompany advanced heart failure.",
    ],
    whatHappens: "Chronic pressure overload (as in hypertension or aortic stenosis) causes the heart muscle to thicken (concentric hypertrophy) to generate more force. Chronic volume overload (as in valvular regurgitation) causes the heart chambers to dilate (eccentric hypertrophy) to accommodate the extra blood volume. Both patterns result in a larger cardiac silhouette on X-ray.",
    causes: [
      "Chronic hypertension (high blood pressure) -- most common cause of LVH",
      "Heart valve disease -- aortic regurgitation or mitral regurgitation",
      "Dilated cardiomyopathy from alcohol, viruses, or genetic factors",
      "Coronary artery disease with prior myocardial infarction (heart attack)",
      "Pericardial effusion (fluid around the heart) can mimic true cardiomegaly",
      "Thyroid disease (both hypothyroidism and hyperthyroidism can affect heart size)",
    ],
    xrayAppearance: "Heart width exceeds half the chest width on PA film (cardiothoracic ratio > 0.5). Left ventricular enlargement: cardiac apex elevated and rounded, heart shadow extends leftward and downward. Right ventricular enlargement: heart appears more globoid with loss of the normal right heart border. Pericardial effusion: 'water bottle' shaped heart silhouette with distinct margins.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  nodule: {
    title: "About lung nodules",
    shortDescription: "Small round mass in the lung -- most are benign but need monitoring",
    paragraphs: [
      "A lung nodule is a small, approximately round mass of abnormal tissue in the lung, typically less than 3 cm in diameter. Larger lesions (3 cm or more) are called masses and carry higher malignancy risk. Lung nodules are extremely common -- found incidentally on 1 in 500 chest X-rays and 1 in 50 CT scans. Most are benign, representing old healed infections, scar tissue, or harmless benign tumors.",
      "The probability that a nodule is cancerous depends primarily on its size, appearance, and the patient's risk factors. Nodules smaller than 6 mm in a non-smoker have a less than 1% chance of being cancer. A nodule larger than 8 mm in a smoker carries a much higher risk. Other concerning features include irregular ('spiculated') borders, growth over time, and upper lobe location.",
      "Characterizing nodules requires CT scan rather than chest X-ray. CT provides size measurements, evaluates internal characteristics (calcification patterns, fat density suggesting hamartoma), and assesses the rest of the lungs and mediastinum. Solid nodules, ground-glass nodules, and part-solid nodules have different likelihoods of malignancy and different surveillance protocols.",
      "Management depends on risk stratification. Low-risk nodules may simply be followed with repeat imaging at 6-12 month intervals to check for growth. Indeterminate nodules may warrant PET scan (useful for solid nodules over 8 mm). Rapidly growing or highly suspicious nodules require tissue sampling via CT-guided biopsy, bronchoscopy, or surgical resection for definitive diagnosis.",
    ],
    whatHappens: "Nodules represent focal areas of abnormal tissue growth or localized inflammation in the lung parenchyma. They form when immune cells cluster around an irritant (infection scar, inhaled particle) or when tumor cells proliferate in a localized area. The surrounding lung tissue remains normal, which is why nodules are sharply demarcated from the surrounding aerated lung.",
    causes: [
      "Benign granulomas from old infections (histoplasmosis, tuberculosis, coccidioidomycosis)",
      "Hamartoma -- the most common benign lung tumor (contains fat and cartilage)",
      "Primary lung cancer (especially in smokers and older adults)",
      "Metastatic cancer from another primary tumor (breast, colon, kidney cancer spreading to lung)",
      "Arteriovenous malformation (abnormal connection between artery and vein)",
      "Rheumatoid nodules (in patients with rheumatoid arthritis) and infectious abscesses",
    ],
    xrayAppearance: "A well-defined round or oval opacity typically less than 3 cm, usually solitary. Benign nodules often have central, diffuse, or laminated calcification patterns. Malignant or indeterminate nodules tend to have irregular, spiculated (star-like) borders and grow over time. A satellite lesion (small nodules around a larger one) suggests inflammatory or infectious etiology rather than cancer.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  mass: {
    title: "About lung masses",
    shortDescription: "Larger lung abnormality -- requires urgent evaluation for cancer",
    paragraphs: [
      "A lung mass is a larger abnormal lesion in the lung, defined as 3 cm or more in diameter. While nodules larger than 3 cm have a higher probability of being malignant than smaller nodules, not all masses are cancer. However, because malignancy rates are significantly higher in masses than in nodules, masses are generally treated with a higher index of suspicion and more urgent workup.",
      "Lung cancer is the most concerning diagnosis in a lung mass, particularly in smokers, older adults, and those with a history of cancer. The two main types are non-small cell lung cancer (NSCLC -- including adenocarcinoma, squamous cell carcinoma, and large cell carcinoma) and small cell lung cancer (SCLC). SCLC is strongly associated with smoking and tends to spread early.",
      "Benign masses are less common in this size range but include infections (tuberculoma, fungal granuloma), hamartomas, and inflammatory pseudotumors. The growth rate is informative: benign masses tend to be stable over years, while malignant masses typically grow. A mass that doubles in size in less than a month is more likely inflammatory (abscess) than cancer.",
      "Evaluation of a lung mass includes CT chest (with contrast), PET scan (to assess metabolic activity and look for metastases), and tissue biopsy (via CT-guided percutaneous biopsy, bronchoscopy with EBUS, or surgical biopsy). Staging determines whether the cancer is confined to the lung or has spread to lymph nodes or distant organs, which determines whether surgery is possible.",
    ],
    whatHappens: "Masses represent uncontrolled cell growth that forms a discrete lesion in the lung parenchyma. In malignancy, cancer cells proliferate in an unregulated manner, forming a tumor that invades surrounding tissue. As the mass grows, it can compress airways (causing obstruction and post-obstructive pneumonia), invade blood vessels (causing bleeding or hemoptysis), or spread through lymphatics and blood vessels to distant sites (metastasis).",
    causes: [
      "Primary lung cancer -- squamous cell carcinoma (central), adenocarcinoma (peripheral), small cell carcinoma",
      "Metastatic cancer from breast, colon, prostate, kidney, or melanoma",
      "Tuberculous granuloma (TB mass or tuberculoma) -- common in endemic areas",
      "Fungal infection mass (histoplasmoma, coccidioidoma) -- particularly in immunocompromised",
      "Hamartoma -- benign tumor containing fat and cartilage, the most common benign lung tumor",
      "Inflammatory pseudotumor (plasma cell granuloma) -- benign but can be locally aggressive",
    ],
    xrayAppearance: "Typically appears as a focal opacity greater than 3 cm with an irregular, spiculated (star-like) border -- particularly suspicious for malignancy. A 'cavitary' mass (containing an air-filled cavity or hole) may indicate squamous cell carcinoma, tuberculosis, or fungal infection. Benign masses tend to be smooth, well-defined, and may contain calcification.",
    urgency: "high",
    reviewRecommended: true,
  },

  hernia: {
    title: "About hiatal hernia",
    shortDescription: "Part of the stomach pushed through the diaphragm -- often an incidental finding",
    paragraphs: [
      "A hiatal hernia occurs when a portion of the stomach protrudes upward through the diaphragmatic esophageal hiatus -- the opening in the diaphragm through which the esophagus passes -- into the thoracic cavity. The stomach may slide up and down (sliding hernia, most common type, 90%) or roll alongside the esophagus (paraesophageal hernia, less common but potentially more serious). Hiatal hernias are extremely common, especially in older adults, and many are incidental findings on chest X-ray.",
      "Most hiatal hernias are small and cause no symptoms. When symptoms occur, they are primarily from gastroesophageal reflux disease (GERD) -- heartburn, acid regurgitation, and dysphagia (difficulty swallowing). This is because the hernia disrupts the anti-reflux mechanism at the gastroesophageal junction. Larger hernias can cause more significant symptoms including chest pain, early satiety, chronic cough, and hoarseness.",
      "Paraesophageal hernias are less common but more concerning. In this type, the gastroesophageal junction stays in place while the fundus (upper part) of the stomach rolls up alongside the esophagus into the chest. This can lead to gastric volvulus (twisting of the stomach), strangulation (cutting off blood supply), and obstruction. These complications are surgical emergencies. The risk increases with hernia size.",
      "Small sliding hernias are managed medically with proton pump inhibitors (PPIs) to reduce acid, lifestyle modifications (elevating the head of bed, weight loss, avoiding late meals), and dietary changes. Large paraesophageal hernias or those causing significant symptoms or complications are treated surgically -- laparoscopic hernia repair with cruropexy (securing the stomach back in the abdomen).",
    ],
    whatHappens: "The diaphragmatic esophageal hiatus widens or weakens, either because of age-related changes, increased abdominal pressure (obesity, pregnancy, chronic coughing), or congenital laxity. This allows abdominal contents -- usually the stomach -- to herniate upward into the thorax. In sliding hernias, the gastroesophageal junction itself moves above the diaphragm. In paraesophageal hernias, the junction stays below while the fundus herniates through a defect.",
    causes: [
      "Age-related weakening of the diaphragmatic esophageal hiatus",
      "Obesity and increased intra-abdominal pressure",
      "Chronic coughing or straining (chronic constipation, heavy lifting)",
      "Pregnancy (temporary increase in intra-abdominal pressure)",
      "Previous surgery or trauma to the gastroesophageal junction",
      "Congenital diaphragmatic hernia ( Bochdalek or Morgagni) -- present from birth",
    ],
    xrayAppearance: "Appears as an air-fluid level or soft tissue mass in the posterior mediastinum above the diaphragm, behind the heart. A nasogastric tube if present may be seen coiled above the diaphragm. On lateral film, the gastroesophageal junction appears above the diaphragmatic hiatus. A retrocardiac air bubble or mass is a classic clue. Barium swallow study is the definitive imaging test for characterizing the hernia type.",
    urgency: "low",
    reviewRecommended: false,
  },

  "lung lesion": {
    title: "About lung lesions",
    shortDescription: "Abnormal area in lung tissue -- further imaging and evaluation needed",
    paragraphs: [
      "A lung lesion is a broad descriptive term for any abnormal area or focus detected in the lung tissue on an X-ray. Unlike a more specific diagnosis, 'lesion' tells you only that something abnormal is present -- it could be benign or malignant, infectious or non-infectious, current or old. The term encompasses nodules, masses, infiltrates, cavities, and other focal abnormalities. Further characterization with CT scan and clinical correlation is almost always needed.",
      "Lung lesions can be classified by their appearance and behavior. Solitary lesions (a single abnormality) are most concerning for primary lung cancer or metastatic disease. Multiple lesions suggest disseminated infection (TB, fungal), inflammatory conditions (sarcoidosis, granulomatosis with polyangiitis), or metastatic cancer. Lesions can also be classified by their radiographic pattern -- cavitary, calcified, ground-glass, spiculated -- each with different diagnostic implications.",
      "The clinical context is critical for narrowing the differential diagnosis. A patient with fever, cough, and a lung lesion is more likely to have an infectious or inflammatory process. A long-term smoker with weight loss and a spiculated lesion is more likely to have lung cancer. Travel history, occupational exposures, immune status, and previous imaging all provide important clues.",
      "A CT scan is the standard next step for evaluating an indeterminate lung lesion seen on chest X-ray. CT provides detailed size measurements, characterizes the internal features (attenuation, calcification, cavitation), and evaluates the mediastinum and liver (for potential metastases). PET scan helps distinguish metabolically active (cancerous) lesions from inactive ones. Tissue sampling via biopsy may ultimately be needed for definitive diagnosis.",
    ],
    whatHappens: "Lung lesions form when an abnormal focus of tissue develops within the lung parenchyma. This can result from uncontrolled cell growth (benign or malignant tumor), inflammatory cell accumulation (granulomas in infection or autoimmune disease), localized infection (abscess, tuberculoma), or bleeding into lung tissue (pulmonary hemorrhage). Each type has a different cellular composition and thus a different radiographic appearance.",
    causes: [
      "Primary lung cancer (adenocarcinoma, squamous cell carcinoma, small cell carcinoma)",
      "Metastatic cancer from an extrathoracic primary tumor",
      "Infectious granulomas: tuberculosis, histoplasmosis, coccidioidomycosis",
      "Inflammatory conditions: sarcoidosis, granulomatosis with polyangiitis, rheumatoid nodules",
      "Pulmonary abscess (localized lung infection with cavity formation)",
      "Pulmonary infarction (death of lung tissue from pulmonary embolism blocking blood supply)",
    ],
    xrayAppearance: "Variable -- depends on the type of lesion. Appears as a focal opacity in the lung field. The pattern, margins, and associated findings (cavitation, calcification, satellite lesions, lymphadenopathy) provide diagnostic clues. A cavitating lesion suggests squamous cell carcinoma, tuberculosis, or fungal infection. Diffuse lesions suggest infection, inflammation, or hemorrhage rather than localized tumor.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  fracture: {
    title: "About rib and chest wall fractures",
    shortDescription: "Broken rib or chest bone -- usually from trauma or weakened bone",
    paragraphs: [
      "A rib or chest wall fracture is a break in one or more of the 12 pairs of ribs, the sternum (breastbone), or the costal cartilage connecting ribs to the sternum. Ribs are most commonly fractured at the point of direct impact or at the bend point laterally (where they are weakest). Multiple adjacent rib fractures can create a 'flail chest' segment -- a potentially life-threatening condition where a section of chest wall moves paradoxically inward during inspiration.",
      "The most common cause is blunt chest trauma -- car accidents, falls from height, sports injuries, or assault. In elderly patients with osteoporosis, even minor trauma or forceful coughing can cause rib fractures. Pathologic fractures occur when cancer has spread to the bone and weakened it -- the rib fractures with minimal or no trauma. A callus (bony healing tissue) from old healed fractures can sometimes mimic acute fractures on X-ray.",
      "The primary symptom is localized chest pain that worsens with deep breathing, coughing, or movement. Patients often splint the chest -- breathing shallowly to minimize movement and pain -- which can lead to atelectasis (partial lung collapse) and pneumonia. In older adults, rib fractures significantly increase morbidity and mortality due to these complications.",
      "Diagnosis is primarily by physical examination (point tenderness over the rib) and chest X-ray. However, X-ray misses approximately half of rib fractures -- especially hairline cracks. CT scan is far more sensitive and should be obtained when fracture is strongly suspected but X-ray is negative, or when there is concern for underlying organ injury (pulmonary contusion, pneumothorax, hemothorax). Treatment is supportive: pain control ( NSAIDs, opioids), incentive spirometry to prevent atelectasis, and monitoring for complications.",
    ],
    whatHappens: "A break in a rib compromises the structural integrity of the thoracic cage. Severe fractures reduce the effectiveness of chest wall movement during breathing. Multiple contiguous fractures create a 'flail segment' that moves paradoxically inward with inspiration while the rest of the chest expands -- severely impairing breathing mechanics and potentially causing respiratory failure.",
    causes: [
      "Blunt chest trauma -- car accident, fall, sports collision, physical assault",
      "Osteoporosis in elderly patients (minimal trauma or forceful coughing can fracture ribs)",
      "Pathologic fracture from bone metastases (lung, breast, prostate cancer spreading to ribs)",
      "Stress fracture from repetitive physical activity (rowers, golfers) -- uncommon",
      "Coughing or sneezing with pre-existing bone weakness",
      "Iatrogenic -- complications from cardiopulmonary resuscitation (CPR, chest compressions)",
    ],
    xrayAppearance: "A lucent fracture line through the rib cortex is the classic finding but may be subtle or absent in hairline fractures. Displaced fractures show step deformity. Callus formation from healing fractures appears as irregular periosteal reaction around the rib. Sternal fractures are often poorly seen on frontal film; lateral sternal view or CT is more sensitive. Associated findings -- pneumothorax, hemothorax, or pulmonary contusion -- may be present.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  "lung opacity": {
    title: "About lung opacity",
    shortDescription: "Whitish area in the lung -- a broad descriptive finding requiring further investigation",
    paragraphs: [
      "Lung opacity is a general radiographic term for any area in the lung that appears whiter than normal. Unlike a specific diagnosis, it describes what is seen on the X-ray, not what it is. The opacity results from any material that replaces air in the alveoli -- fluid, inflammatory exudate, blood, or tumor tissue. Multiple conditions produce similar-appearing opacities, which is why clinical correlation is essential for diagnosis.",
      "Lung opacities are classified by their distribution and pattern. Focal (localized) opacities suggest a localized process -- pneumonia, tumor, infarction, or trauma. Diffuse (widespread) opacities suggest systemic or bilateral processes -- pulmonary edema, diffuse alveolar hemorrhage, ARDS, or diffuse infection. The pattern (consolidation vs ground-glass vs reticular) narrows the differential significantly.",
      "Consolidation opacities (alveolar filling) are dense, white, and have relatively well-defined borders where they meet aerated lung. They often show air bronchograms because the bronchi remain air-filled. Ground-glass opacity is less dense -- you can still see the underlying lung structures through it -- and suggests partial filling of alveoli or thickening of the interstitial tissue. Reticular opacities are fine line-like patterns suggesting interstitial disease rather than alveolar filling.",
      "Further investigation typically starts with CT scan for better characterization. Clinical history -- fever (suggests infection), cardiac history (suggests edema), trauma (suggests contusion or hemorrhage), immune status (immunocompromised patients are susceptible to opportunistic infections) -- guides the differential diagnosis and next steps. In some cases, bronchoalveolar lavage or lung biopsy provides a definitive diagnosis.",
    ],
    whatHappens: "Lung opacity develops when the normally air-filled alveoli are partially or completely filled with material that blocks X-ray penetration -- fluid, inflammatory cells, blood, or tumor cells. The denser the material, the whiter the opacity. When the filling is partial, the opacity appears as ground-glass (faint haze). When the filling is complete, it appears as consolidation (dense white).",
    causes: [
      "Pneumonia (bacterial, viral, or fungal infection of the lung)",
      "Pulmonary edema from left-sided heart failure",
      "Pulmonary hemorrhage (bleeding into the alveoli from trauma, vasculitis, or coagulation disorder)",
      "Acute respiratory distress syndrome (ARDS) from sepsis, trauma, or aspiration",
      "Lung cancer or lymphoma (tumor cells filling alveoli)",
      "Alveolar proteinosis (rare condition where surfactant-like material accumulates in alveoli)",
    ],
    xrayAppearance: "Variable depending on the cause. Consolidation: homogeneous white opacity with air bronchograms visible within it, often with a relatively sharp border against aerated lung. Ground-glass opacity: hazy increase in density through which bronchovascular structures remain visible. Nodular opacity: multiple small round opacities. The distribution (unilateral vs bilateral, central vs peripheral, upper vs lower lobe) provides important diagnostic clues.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  "enlarged cardiomediastinum": {
    title: "About an enlarged cardiomediastinum",
    shortDescription: "Widened heart and central chest structures -- evaluate the underlying cause",
    paragraphs: [
      "An enlarged cardiomediastinum means the heart and central chest structures appear wider than normal on a chest X-ray. The mediastinum is the central compartment of the chest, housing the heart, great vessels, trachea, esophagus, and lymph nodes. Any of these structures being abnormal in size or shape can cause the mediastinal silhouette to appear widened. This is a descriptive finding that always requires explanation.",
      "The most common cause of cardiomediastinal widening is cardiomegaly -- an enlarged heart from hypertension, heart failure, valvular disease, or cardiomyopathy. Other causes include aortic aneurysm or aortic unfolding (elongation and tortuosity of the aorta with age), mediastinal mass (lymphoma, thymoma, germ cell tumor, retrosternal thyroid), lymphadenopathy (from infection, sarcoidosis, or metastatic cancer), and pericardial effusion (fluid around the heart).",
      "A key distinction is whether the widening represents a vascular structure (aorta) vs a mass vs cardiomegaly vs fluid. Lateral chest X-ray helps by showing which compartment is affected. Contrast-enhanced CT is the standard for evaluating mediastinal masses, aortic aneurysms, and pericardial effusion. MRI provides detailed cardiac and vascular imaging without radiation.",
      "In some patients, mediastinal widening is a normal variant -- particularly in young adults where an over-penetrated film makes normal structures appear wider. Obesity and poor film technique (expiratory film, rotation, high KV settings) can also artifactually widen the mediastinal silhouette. These false positives should be recognized and not trigger unnecessary investigation.",
    ],
    whatHappens: "Enlargement of the heart (cardiomegaly) increases the transverse diameter of the cardiac silhouette on frontal X-ray. Dilation or unfolding of the aorta increases the width of the mediastinum on the left side. Mediastinal masses or lymph nodes enlarge the mediastinal contour in the region of involvement. Pericardial effusion accumulates fluid around the heart, creating a 'water bottle' shaped silhouette.",
    causes: [
      "Cardiomegaly from hypertension, heart failure, valvular heart disease, or cardiomyopathy",
      "Aortic aneurysm or aortic unfolding/elongation (common with aging)",
      "Mediastinal lymphadenopathy from lymphoma, metastatic cancer, or infection",
      "Mediastinal mass -- thymoma, germ cell tumor, retrosternal goiter",
      "Pericardial effusion (fluid around the heart from pericarditis or malignancy)",
      "Superior vena cava syndrome with mediastinal venous distension",
    ],
    xrayAppearance: "Mediastinal width exceeding 8 cm on PA film or greater than one-quarter of the chest width. The pattern of widening provides clues: left-sided convex bulging suggests aortic aneurysm; right-sided widening suggests mediastinal mass or lymphadenopathy; a 'water bottle' heart suggests pericardial effusion. Lateral film shows which compartment is involved -- anterior, middle, or posterior mediastinum.",
    urgency: "moderate",
    reviewRecommended: true,
  },

  // ─── Skin Lesion Labels ──────────────────────────────────────────────

  benign: {
    title: "About benign skin lesions",
    shortDescription: "Non-cancerous skin growth -- monitor for any changes",
    paragraphs: [
      "A benign skin-lesion result means the image was more consistent with a non-cancerous growth in this screening model. Benign lesions are extremely common -- most adults have between 10 and 40 moles and numerous other harmless skin changes. Common benign lesions include seborrheic keratoses (warty, stuck-on brown growths that appear with age), angiomas (small bright red or purple dots), common moles (nevi), dermatofibromas (firm brown or red nodules, often on the legs), and lipomas (soft fatty lumps under the skin).",
      "While these lesions are benign, they can occasionally be difficult to distinguish from early skin cancer -- especially melanoma, which can begin as a flat, irregularly colored patch. This is why regular skin self-examination is important: watch for new spots, or existing spots that change in size, shape, color, texture, or behavior (bleeding, itching, not healing). The ABCDE rule helps identify potentially concerning features.",
      "The ABCDE rule for melanoma: Asymmetry (one half different from the other), Border irregularity (edges ragged or blurred), Color variation (multiple shades of brown, black, red, white, or blue within the same lesion), Diameter greater than 6 mm, and Evolution (changing over weeks to months). Any lesion meeting these criteria should prompt a dermatologist visit.",
      "Most benign skin lesions require no treatment unless they are irritated, cosmetically bothersome, or in a location where they are repeatedly traumatized. A dermatologist can evaluate any concerning lesion with dermoscopy (a magnifying light that reveals subsurface patterns) and perform a biopsy if any lesion appears suspicious. Annual skin checks are recommended for people with a history of significant sun exposure or skin cancer.",
    ],
    whatHappens: "Benign lesions result from normal or slightly abnormal proliferation of skin cells. Moles form from clusters of melanocytes (pigment-producing cells). Seborrheic keratoses are caused by overgrowth of keratinocytes (the main skin cell type). Angiomas are tiny benign blood vessel growths. These proliferations are controlled and do not invade surrounding tissue or spread to other parts of the body.",
    causes: [
      "Sun exposure triggering melanocyte proliferation (common moles, solar lentigines)",
      "Aging -- seborrheic keratoses become very common after age 50",
      "Genetic predisposition -- family history of atypical moles or melanoma increases risk",
      "HPV infection -- some warts and seborrheic keratoses are thought to relate to viral triggers",
      "Trauma or chronic irritation to a specific skin area",
      "Hormonal changes -- pregnancy can cause new moles or darkening of existing ones",
    ],
    xrayAppearance: "N/A -- these are skin surface findings. On skin examination with dermoscopy, benign lesions typically show a uniform reticular network (moles), milia-like cysts, comma vessels, or globular patterns. The key reassuring feature is symmetry, uniform color, and stable appearance over time.",
    urgency: "low",
    reviewRecommended: false,
  },

  malignant: {
    title: "About suspicious skin lesions",
    shortDescription: "Suspicious features detected -- prompt dermatology review recommended",
    paragraphs: [
      "A malignant skin-lesion result means the model detected image features that can be associated with a cancerous lesion. Skin cancer is the most common cancer in humans, and its incidence is rising globally, primarily driven by UV exposure from sunlight and tanning beds. The three main types are melanoma (arising from melanocytes -- the pigment-producing cells), basal cell carcinoma (from basal keratinocytes -- most common but rarely metastasizes), and squamous cell carcinoma (from squamous keratinocytes -- can metastasize if neglected).",
      "Melanoma is the most dangerous form because it can spread early through lymphatics and blood vessels to distant organs (brain, lung, liver). It often begins as a new or changing mole. The 'ugly duckling' sign -- a lesion that looks clearly different from all others on the body -- is an important clinical clue. Nodular melanoma grows vertically from the start and can be rapidly fatal if not caught early.",
      "Basal cell carcinoma (BCC) is the most common skin cancer but has an excellent prognosis when treated early -- it grows slowly and rarely metastasizes (less than 0.1%). It typically appears as a pearly, translucent bump with visible blood vessels (telangiectasias), often on sun-exposed areas like the face. Squamous cell carcinoma (SCC) is more aggressive than BCC and can metastasize, particularly from the lips, ears, and immunosuppressed patients.",
      "Early detection dramatically improves outcomes, especially for melanoma. A dermatologist can examine suspicious lesions with dermoscopy to assess patterns invisible to the naked eye, and perform a biopsy -- taking a small sample or removing the entire lesion -- for microscopic examination. Treatment depends on the cancer type, depth, and location, and ranges from topical creams (for very early superficial lesions) to surgical excision, Mohs micrographic surgery, radiation, or immunotherapy for advanced disease.",
    ],
    whatHappens: "UV radiation damages the DNA of skin cells, causing mutations that allow uncontrolled cell proliferation. In melanoma, mutations in melanocytes lead to their malignant transformation and potential spread. In BCC and SCC, mutations in keratinocytes cause locally invasive and destructive growth. The immune system normally eliminates many pre-cancerous cells, but chronic UV exposure overwhelms this protection over time.",
    causes: [
      "Chronic UV exposure from sunlight -- the primary cause of most skin cancers",
      "Indoor tanning bed use -- particularly dangerous for young users",
      "Fair skin, light eyes, blonde or red hair -- less protective melanin pigment",
      "Family history of melanoma or atypical mole syndrome",
      "Immunosuppression (organ transplant recipients, HIV/AIDS patients)",
      "Previous skin cancer -- patients with one skin cancer have high risk of developing another",
    ],
    xrayAppearance: "N/A -- these are skin surface findings. On dermoscopy, malignant lesions often show irregular pigment networks, multiple colors (brown, black, red, white, blue), asymmetric structures, and atypical vascular patterns. The clinical appearance of melanoma includes the ABCDE signs: asymmetry, irregular borders, color variation, diameter over 6mm, and evolution (change over time).",
    urgency: "high",
    reviewRecommended: true,
  },
};

/**
 * Normalize a model label for lookup in the disease info table.
 * Handles underscores, capitalization differences, and whitespace.
 * e.g. "Pleural_Thickening" -> "pleural thickening"
 */
export function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/_+/g, " ").trim();
}

/**
 * Get detailed information for a model label.
 * Returns full disease info with paragraphs, causes, and X-ray appearance.
 */
export function getFindingDetail(label: string): FindingDetail | undefined {
  return DISEASE_DETAIL[normalizeLabel(label)];
}

/**
 * Get short finding info for a model label (used in the findings list).
 */
export function getFindingInfo(label: string): FindingInfo | undefined {
  const detail = DISEASE_DETAIL[normalizeLabel(label)];
  if (!detail) return undefined;
  return {
    shortDescription: detail.shortDescription,
    explanation: detail.paragraphs.join(" "),
    urgency: detail.urgency,
    reviewRecommended: detail.reviewRecommended,
  };
}

/** Short finding info type (used in findings list) */
export type FindingInfo = {
  shortDescription: string;
  explanation: string;
  urgency: "low" | "moderate" | "high";
  reviewRecommended: boolean;
};

/**
 * Urgency color mapping for UI display.
 */
export const URGENCY_STYLES: Record<FindingDetail["urgency"], { color: string; bg: string; label: string }> = {
  low: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Low urgency" },
  moderate: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", label: "Review recommended" },
  high: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Prompt review" },
};
