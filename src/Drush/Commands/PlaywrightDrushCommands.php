<?php

namespace playwright_drupal_utils\Drush\Commands;

use drunomics\ServiceUtils\Core\Database\DatabaseConnectionTrait;
use drunomics\ServiceUtils\Core\Entity\EntityTypeManagerTrait;
use drunomics\ServiceUtils\Core\Path\AliasManagerTrait;
use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Logger\RfcLogLevel;
use Drupal\node\NodeInterface;
use Drush\Commands\DrushCommands;

/**
 * Defines command for dealing with playwright testing requirements.
 */
class PlaywrightDrushCommands extends DrushCommands {
  use EntityTypeManagerTrait;
  use AliasManagerTrait;
  use DatabaseConnectionTrait;

  /**
   * Clone a node with given title.
   *
   * @param string $node_type
   *   Type of the node to clone.
   * @param string $node_title
   *   The title of node to be cloned.
   * @param string $new_node_title
   *   Title of the clone.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-clone
   * @aliases nc
   */
  public function cloneNodeByTitle($node_type, $node_title, $new_node_title) {
    $storage = $this->getEntityTypeManager()->getStorage('node');
    $nodes = $storage->loadByProperties([
      'title' => $node_title,
      'type' => $node_type,
    ]);
    if (!$node = reset($nodes)) {
      throw new \RuntimeException('Unable to load node.');
    }
    $clone = $node->createDuplicate();
    $clone->title = $new_node_title;
    if ($clone->hasField('moderation_state')) {
      $clone->set('moderation_state', "published");
    }
    $clone->save();
  }

  /**
   * Change primary topic of node.
   *
   * @param string $title
   *   Title of the node.
   * @param string $name
   *   Primary topic to set.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-set-primary-topic
   * @aliases nspt
   */
  public function changeNodePrimaryTopic($title, $name) {
    $entityTypeManager = $this->getEntityTypeManager();
    $nodes = $entityTypeManager
      ->getStorage('node')
      ->loadByProperties([
        'title' => $title,
      ]);
    if ($node = reset($nodes)) {
      $terms = $entityTypeManager
        ->getStorage('taxonomy_term')
        ->loadByProperties([
          'vid' => 'topics',
          'name' => $name,
        ]);
      if ($term = reset($terms)) {
        $node->field_topic->target_id = $term->id();
        pathauto_entity_delete($node);
        $node->save();
      }
      else {
        throw new \Exception('Unable to load term.');
      }
    }
    else {
      throw new \Exception('Unable to load node.');
    }
    return 'Primary topic of node "' . $title . '" changed to "' . $name . '"';
  }

  /**
   * Change channel of node.
   *
   * @param string $title
   *   Title of the node.
   * @param string $name
   *   Primary topic to set.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-set-channel
   * @aliases nsc
   */
  public function changeNodeChannel($title, $name) {
    $entityTypeManager = $this->getEntityTypeManager();
    $nodes = $entityTypeManager
      ->getStorage('node')
      ->loadByProperties([
        'title' => $title,
      ]);
    if ($node = reset($nodes)) {
      $terms = $entityTypeManager
        ->getStorage('taxonomy_term')
        ->loadByProperties([
          'vid' => 'channel',
          'name' => $name,
        ]);
      if ($term = reset($terms)) {
        $node->field_channel->target_id = $term->id();
        pathauto_entity_delete($node);
        $node->save();
      }
      else {
        throw new \Exception('Unable to load term.');
      }
    }
    else {
      throw new \Exception('Unable to load node.');
    }
    return 'Channel of node "' . $title . '" changed to "' . $name . '"';
  }

  /**
   * Gets id of node with given title.
   *
   * @param string $title
   *   Title of the node.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-get-id
   * @aliases ngid
   */
  public function getNodeIdWithTitle(string $title): string {
    $nodes = $this->getEntityTypeManager()->getStorage('node')->loadByProperties([
      'title' => $title,
    ]);
    foreach ($nodes as $node) {
      if ($node instanceof NodeInterface) {
        if ($node->getTitle() === $title) {
          return $node->id();
        }
      }
    }
    throw new \Exception("Could not find node with title '{$title}'");
  }

  /**
   * Gets path of node with given title.
   *
   * @param string $title
   *   Title of the node.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-get-path
   * @aliases ngpath
   */
  public function getNodePathWithTitle(string $title): string {
    $nodes = $this->getEntityTypeManager()->getStorage('node')->loadByProperties([
      'title' => $title,
    ]);
    if ($node = reset($nodes)) {
      return parse_url($node->toUrl()->toString(), PHP_URL_PATH);
    }
    throw new \Exception("Could not find node with title '{$title}'");
  }

  /**
   * Gets path alias of node with given title.
   *
   * @param string $title
   *   Title of the node.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-get-path-alias
   * @aliases ngpath-alias
   */
  public function getNodePathAliasWithTitle(string $title): string {
    $nodes = $this->getEntityTypeManager()->getStorage('node')->loadByProperties([
      'title' => $title,
    ]);
    if ($node = reset($nodes)) {
      return $this->getAliasManager()->getAliasByPath('/node/' . $node->id());
    }
    throw new \Exception("Could not find node with title '{$title}'");
  }

  /**
   * Gets canonical url.
   *
   * @return string
   *
   * @throws \Exception
   *
   * @bootstrap full
   * @command test:get-canonical-url
   * @aliases gcanonical
   */
  public function getCanonicalUrl(): string {
    if ($site_url = \Drupal::service('ldp_ce_api.ldp_base_url_provider')->getFrontendBaseUrl()) {
      return $site_url . '/';
    }
    throw new \Exception('Could not load canonical url');
  }

  /**
   * Clean-up content we created.
   *
   * @param string $keyword
   *   Title of the node.
   *
   * @bootstrap full
   * @command test:testsCleanUp
   * @aliases testcu
   */
  public function cleanUpContent(string $keyword) {
    $node_storage = $this->getEntityTypeManager()->getStorage('node');
    $nids = $node_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('title', $keyword, 'STARTS_WITH')
      ->execute();
    if (!empty($nids)) {
      $nodes = $node_storage->loadMultiple($nids);
      if (!empty($nodes)) {
        $node_storage->delete($nodes);
      }
    }
    $taxonomy_term_storage = $this->getEntityTypeManager()->getStorage('taxonomy_term');
    $tids = $taxonomy_term_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('name', $keyword, 'STARTS_WITH')
      ->execute();
    if (!empty($tids)) {
      $terms = $taxonomy_term_storage->loadMultiple($tids);
      if (!empty($terms)) {
        $taxonomy_term_storage->delete($terms);
      }
    }
    $media_storage = $this->getEntityTypeManager()->getStorage('media');
    $mids = $media_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('name', $keyword, 'STARTS_WITH')
      ->execute();
    if (!empty($mids)) {
      $media = $media_storage->loadMultiple($mids);
      if (!empty($media)) {
        $media_storage->delete($media);
      }
    }
  }

  /**
   * Gets cors config.
   *
   *   Useful for checking if cors is properly configured.
   *
   * @bootstrap full
   * @command test:get-cors
   * @aliases gcors
   */
  public function getCorsParams() {
    return json_encode(\Drupal::getContainer()->getParameter('cors.config'), JSON_PRETTY_PRINT);
  }

  /**
   * Check if there are errors in watchdog.
   *
   * @param int $timestamp
   *   Timestamp from when to look for errors.
   * @param bool $fail_on_notice
   *   Variable to change severity level of which watchdog errors to load.
   * @param bool $verbose
   *   Print error messages as well.
   *
   * @bootstrap full
   * @command test:checkWatchdog
   * @aliases testcw
   */
  public function checkForWatchdogErrors(int $timestamp, bool $fail_on_notice = FALSE, bool $verbose = FALSE) : string {
    $severity_level = $fail_on_notice ? RfcLogLevel::NOTICE : RfcLogLevel::WARNING;
    // Check if microtime was used as parameter and convert to unix timestamp.
    if ($timestamp > 10 ** 13) {
      $timestamp /= 1000;
    }
    $query = $this->getDatabaseConnection()->select('watchdog', 'w');
    $query->fields("w");
    $query->condition('timestamp', $timestamp, '>');
    $query->condition('severity', $severity_level, '<=');
    $query->condition('type', 'php');
    $query->orderBy('timestamp', 'DESC');
    $log_entries = $query->execute()->fetchAllAssoc('wid');
    $result = [
      'numberOfErrors' => 0,
      'errors' => [],
    ];
    if ($log_entries && is_array($log_entries)) {
      foreach ($log_entries as $entry) {
        // @see \Drupal\dblog\Controller\DbLogController::formatMessage()
        $variables = @unserialize($entry->variables);
        if ($verbose) {
          $message = (new FormattableMarkup($entry->message, $variables));
          $result['errors'][] = [
            'message' => $message ?? '',
            'wid' => $entry->wid ?? '',
            'type' => $entry->type ?? '',
            'severity' => $entry->severity ?? '',
          ];
        }
        $result['numberOfErrors'] += 1;
      }
    }
    return json_encode($result, JSON_PRETTY_PRINT);
  }

}
